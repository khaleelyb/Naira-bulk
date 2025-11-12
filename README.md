# Supabase Backend Setup for NairaBulk

This document provides the necessary steps to configure the Supabase backend that powers the NairaBulk order form application.

## Prerequisites

- You need a free account at [supabase.com](https://supabase.com).

---

## Step 1: Create a New Supabase Project

1.  Log in to your Supabase account.
2.  On the Dashboard, click **"New project"**.
3.  Choose your organization, give your project a **Name** (e.g., `nairabulk-app`), and generate a secure **Database Password**.
4.  Select a **Region** that is closest to your user base.
5.  Click **"Create new project"** and wait for it to be set up.

---

## Step 2: Database Setup

You need to create two tables: `orders` and `config`.

1.  In the left sidebar, navigate to the **SQL Editor**.
2.  Click **"+ New query"**.
3.  Copy the entire SQL script below, paste it into the SQL Editor, and click **"RUN"**.

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

## Step 3: Storage Setup

The application needs a public storage bucket to store user-uploaded screenshots and payment proofs.

1.  In the left sidebar, navigate to **Storage**.
2.  Click **"Create a new bucket"**.
3.  Set the **Bucket name** to `nairabulk`.
4.  Toggle the **Public bucket** option to **ON**.
5.  Click **"Create bucket"**.

---

## Step 4: Security Policies (Row Level Security)

These rules are essential to secure your data. They define who can access and modify your database and storage.

1.  In the left sidebar, navigate to **Authentication** -> **Policies**.
2.  Select the **`orders`** table and click **"New Policy"**. Create the following three policies:
    *   **Policy 1: Allow anonymous users to create new orders.**
        *   Policy template: **Enable INSERT for anonymous users**
        *   Review the policy and click **"Save policy"**.
    *   **Policy 2: Allow anonymous users to update an order with their payment proof.**
        *   Policy template: **Enable UPDATE for anonymous users**
        *   In the `USING expression` and `WITH CHECK expression`, change `true` to `(auth.role() = 'anon')`. This allows any anonymous user (i.e., any visitor from the web app) to perform this action.
        *   **Target roles**: `anon`
        *   Review the policy and click **"Save policy"**.
    *   **Policy 3: Allow admin (using anon key) to read all orders.**
        *   Policy template: **Enable read access for anonymous users**
        *   Review the policy and click **"Save policy"**.
        *   **Note**: This is for the admin panel to function with the current app design. For higher security, you would create a separate "admin" role and use a different API key.

3.  Select the **`config`** table and click **"New Policy"**. Create the following two policies:
    *   **Policy 1: Allow anonymous users to read the configuration.**
        *   Policy template: **Enable read access for anonymous users**
        *   Review the policy and click **"Save policy"**.
    *   **Policy 2: Allow admin (using anon key) to update the configuration.**
        *   Policy template: **Enable UPDATE for anonymous users**
        *   Review the policy and click **"Save policy"**.

4.  Navigate back to **Storage** and click the three dots (`...`) on your `nairabulk` bucket, then select **"Policies"**. Create the following policies:
    *   **Allow anonymous `select`, `insert`, `update`, and `delete` on all files.**
        *   Click **"New Policy"** for `select` and create from scratch. Give it a name like `Public Read Access` and check the `select` box. Leave the policy definition as is. Click **"Review"** and **"Save policy"**.
        *   Repeat this process for `insert`, `update`, and `delete`. The app requires all four permissions to handle file uploads, re-uploads (upsert), and cleanup on failure.

---

## Step 5: Get Project URL and API Key

The application code needs your project's unique URL and the public `anon` key to connect to Supabase.

1.  In the left sidebar, go to **Project Settings** (the gear icon).
2.  Select **API**.
3.  Under **Project API keys**, you will find the **public `anon` key**. Copy this key.
4.  This key is what you must set as the `API_KEY` environment variable in the deployment environment for your application.
5.  The **Project URL** is also listed on this page. The application code already has this hardcoded, but it's good to know where to find it.

Your Supabase backend is now fully configured and ready to be used by the NairaBulk application.
