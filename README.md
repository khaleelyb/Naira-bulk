

```sql
-- Create the table to store all customer orders
CREATE TABLE public.orders (
  "orderId" TEXT NOT NULL PRIMARY KEY,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "store" TEXT NOT NULL,
  "screenshot" TEXT NOT NULL, -- URL to the uploaded screenshot
  "notes" TEXT,
  "paymentProof" TEXT, -- URL to the uploaded payment proof
  "isProcessed" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create the table for application configuration, like the service status
CREATE TABLE public.config (
  "key" TEXT NOT NULL PRIMARY KEY,
  "value" JSONB
);

-- Add a comment to describe the orders table
COMMENT ON TABLE public.orders IS 'Stores customer order information for NairaBulk.';
```

---

