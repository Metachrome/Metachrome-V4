#!/bin/bash

# Script to run database migration for adding transaction fields
# This adds missing fields to the transactions table

echo "🔧 Running database migration: add_transaction_fields.sql"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL to your PostgreSQL connection string"
    exit 1
fi

# Run the migration
psql "$DATABASE_URL" -f migrations/add_transaction_fields.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

