// Import
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "../../_node/d3-require@1.3.0/index.js";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");

export class CapTable {
  constructor() {
    this.entries = []; // Tracks all cap table entries
  }

  addEntry(asset, quantity, value, timestamp) {
    this.entries.push({
      awardee: asset.awardee,
      type: asset.type,
      preference: asset.preference,
      quantity,
      value,
      timestamp,
    });
  }

  removeEntry(awardee, quantity, allowPurchase = false, purchasePrice = 0) {
    const removalTime = new Date().toISOString();
    const remainingEntries = [];

    for (const entry of this.entries) {
      if (entry.awardee === awardee && quantity > 0) {
        if (allowPurchase) {
          // Employee purchases shares, they stay in cap table
          const purchasedQuantity = Math.min(quantity, entry.quantity);
          this.entries.push({
            ...entry,
            quantity: purchasedQuantity,
            value: purchasedQuantity * purchasePrice,
            timestamp: removalTime,
          });
          quantity -= purchasedQuantity;
        } else {
          // Options flow back to the company
          entry.quantity -= quantity;
          quantity = Math.max(0, quantity - entry.quantity);
          if (entry.quantity > 0) remainingEntries.push(entry);
        }
      } else {
        remainingEntries.push(entry);
      }
    }

    this.entries = remainingEntries;
  }

  generateCapTable() {
    return this.entries.map((entry) => ({
      awardee: entry.awardee,
      type: entry.type,
      preference: entry.preference,
      quantity: entry.quantity,
      value: entry.value,
      timestamp: entry.timestamp,
    }));
  }
}

export class Asset {
  constructor(type, preference, awardee) {
    this.type = type; // "stock" or "option"
    this.preference = preference; // "common" or "preferred"
    this.awardee = awardee; // "employee", "executive", "advisor", "other"
  }
}

export class InvestmentStage {
  constructor(name, shares = 0, investment = 0, pricePerShare = 1.0) {
    this.name = name; // e.g., "Formation", "Series A"
    this.shares = shares; // Number of shares in this stage
    this.investment = investment; // Investment amount in this stage
    this.pricePerShare = pricePerShare;
    this.ownership = []; // Array of ownership entries
  }

  addOwnership(asset, quantity) {
    this.ownership.push({
      asset: asset,
      quantity: quantity,
    });
  }

  calculateOwnership() {
    const totalShares = this.ownership.reduce(
      (sum, entry) => sum + entry.quantity,
      0
    );
    return this.ownership.map((entry) => ({
      asset: entry.asset,
      quantity: entry.quantity,
      percentage: (entry.quantity / totalShares) * 100,
    }));
  }
}

export class InvestmentTimeline {
  constructor() {
    this.stages = [];
  }

  addStage(stage) {
    this.stages.push(stage);
  }

  getTimeline() {
    return this.stages.map((stage) => ({
      name: stage.name,
      investment: stage.investment,
      pricePerShare: stage.pricePerShare,
      ownership: stage.calculateOwnership(),
    }));
  }
}
