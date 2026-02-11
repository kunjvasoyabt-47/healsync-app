# 🏥 HealSync 

**HealSync** is a robust, full-stack healthcare management platform designed to streamline doctor-patient interactions. It simplifies appointment scheduling, medical record management, and healthcare payments.

---
https://healsync-app.vercel.app/login

## 🚀 Key Features

* **Dual-Role Authentication:** Dedicated workflows for **Doctors** and **Patients** with secure JWT-based sessions and Refresh Token rotation.
* **Smart Scheduling:** Real-time appointment booking with race-condition protection using Prisma Transactions.
* **Secure Payments:** Integrated **Stripe Checkout** flow. Appointments are automatically confirmed via Stripe Webhooks.
* **Automated Cleanup:** A background cron job (Node-Cron) that automatically rejects expired payment windows (3 hours) to release slots.
* **Medical Reports:** File upload support for medical reports via **Cloudinary**.
* **Email System:** Reliable notification system for password resets and appointment status updates using the **Resend API**.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 15 (App Router)
* **State Management:** React Context API / Hooks
* **Styling:** Tailwind CSS

### Backend
* **Runtime:** Node.js & Express
* **Language:** TypeScript
* **ORM:** Prisma (PostgreSQL)
* **Authentication:** JWT, BcryptJS, Cookie-parser

### Services
* **Payments:** Stripe API
* **Storage:** Cloudinary
* **Email:** Smtp
* **Deployment:** Vercel (Serverless Functions)

---

