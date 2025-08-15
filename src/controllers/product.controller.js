import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';
import Model from '../models/Product.js';
import XLSX from 'xlsx';
import mongoose from 'mongoose';

export async function create(req, res, next) {
  try {
    const doc = await Model.create(req.body);
    res.status(StatusCodes.CREATED).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    console.log(req.query);
    const { page = 1, limit = 20, q } = req.query;
    
    const filter = q ? { $text: { $search: q } } : {};
    if(!req.query.page&& !req.query.limit&& !req.query.q){
      const docs = await Model.find()
      res.json(docs);
    }else{
      const docs = await Model.find(filter).skip((page-1)*limit).limit(Number(limit));
    res.json(docs);
    }
    
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const doc = await Model.findById(req.params.id);
    if (!doc) return next(new ApiError(StatusCodes.NOT_FOUND, 'Product not found'));
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return next(new ApiError(StatusCodes.NOT_FOUND, 'Product not found'));
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new ApiError(StatusCodes.NOT_FOUND, 'Product not found'));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}

export async function bulkUpload(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded'));
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return next(new ApiError(StatusCodes.BAD_REQUEST, 'Excel file has no sheets'));
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (!Array.isArray(rows) || rows.length === 0) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Excel sheet is empty'));
    }

    const errors = [];
    const operations = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      // Build a case-insensitive map of headers
      const lcEntries = Object.entries(row).map(([k, v]) => [String(k).toLowerCase().trim(), v]);
      const lcMap = new Map(lcEntries);
      const getVal = (...aliases) => {
        for (const a of aliases) {
          const v = lcMap.get(String(a).toLowerCase());
          if (v !== undefined && v !== null && String(v).trim() !== '') return v;
        }
        return undefined;
      };

      const name = getVal('name', 'productname', 'title');
      const skuRaw = getVal('sku', 'productsku');
      const priceRaw = getVal('price', 'unitprice');
      const description = getVal('description', 'desc');
      const categoryRaw = getVal('category', 'categoryid');
      const stockRaw = getVal('stockquantity', 'quantity', 'stock');
      const isActiveRaw = getVal('isactive', 'active');

      const rowNumber = index + 2; // assuming first row is header

      // Required fields validation
      const sku = skuRaw ? String(skuRaw).trim() : '';
      const price = priceRaw !== undefined ? Number(priceRaw) : NaN;

      if (!name || !sku || Number.isNaN(price)) {
        errors.push({ row: rowNumber, message: 'Missing or invalid required fields: name, sku, price' });
        continue;
      }

      const productData = {
        name: String(name).trim(),
        sku,
        price: Number(price),
      };

      if (description !== undefined) productData.description = String(description).trim();

      if (stockRaw !== undefined && String(stockRaw).trim() !== '') {
        const stockQuantity = Number(stockRaw);
        if (!Number.isNaN(stockQuantity)) productData.stockQuantity = stockQuantity;
      }

      if (isActiveRaw !== undefined) {
        const normalized = String(isActiveRaw).toLowerCase().trim();
        productData.isActive = ['true', '1', 'yes', 'y'].includes(normalized) ? true
          : ['false', '0', 'no', 'n'].includes(normalized) ? false
          : undefined;
      }

      if (categoryRaw) {
        const cat = String(categoryRaw).trim();
        if (/^[a-f0-9]{24}$/i.test(cat)) {
          productData.category = new mongoose.Types.ObjectId(cat);
        }
        // If not a valid ObjectId, ignore; category by name mapping can be added later
      }

      operations.push({
        updateOne: {
          filter: { sku: productData.sku },
          update: { $set: productData },
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      });
    }

    let resultSummary = { inserted: 0, updated: 0, errors };
    if (operations.length > 0) {
      const bulkResult = await Model.bulkWrite(operations, { ordered: false });
      // Mongoose returns upsertedCount and modifiedCount in bulkResult.result for some versions
      const upserted = bulkResult.upsertedCount ?? bulkResult.result?.upserted?.length ?? 0;
      const modified = bulkResult.modifiedCount ?? bulkResult.result?.nModified ?? 0;
      resultSummary.inserted = upserted;
      resultSummary.updated = modified;
    }

    res.status(StatusCodes.OK).json(resultSummary);
  } catch (err) {
    next(err);
  }
}
