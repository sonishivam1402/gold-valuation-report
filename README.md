# Shivam Jewellers & Finance — Gold Jewellery Valuation Report Generator

A dedicated web application developed for **Shivam Jewellers & Finance**, Vadodara, Gujarat, to create customer-specific Gold Jewellery Valuation Reports for insurance, domestic appraisal, and asset evaluation purposes.

## Business Details
- **Business Name**: Shivam Jewellers & Finance
- **Tagline**: GOLD & SILVER ORNAMENTS
- **Proprietor**: Sanjay B. Soni
- **Mobile**: 98982 94948
- **Address**: Shop No. 3, Shree Ram Appt., Near Ranchhodji Mandir, Lakdipool, Dandia Bazar, Vadodara – 390001.

---

## Key Features

1. **Multi-Step Shopkeeper Workflow**:
   - **Step 1: Customer Details**: Customer Name, Full Address, Mobile Number (with 10-digit Indian mobile validation), and Valuation Date.
   - **Step 2: Jewellery Details**: Dynamic line items for gold ornaments (Necklace, Bangles, Chains, Rings, Coins, etc.) with gross weight, stone/impurity weight deduction, net weight calculation, carat purity selection, and monetary evaluation.
   - **Step 3: Terms & Conditions**: Standard 6-clause English legal disclaimer and terms.
   - **Step 4: Preview & Generate**: Full A4 preview with real-time toggle between full letterhead and content-only pre-printed stationery mode.

2. **Valuation Calculation Engine**:
   - $\text{Net Weight} = \text{Gross Weight} - \text{Impurity / Stone Weight}$
   - **Rate Basis Choice**:
     - *Rate per stated purity*: $\text{Value} = \text{Net Weight} \times \text{Gold Rate}$
     - *24K Benchmark reference*: $\text{Value} = \text{Net Weight} \times \left(\frac{\text{Purity}}{24}\right) \times \text{24K Gold Rate}$
   - Indian currency format (`₹ 1,45,200.00`) and Indian number-to-words spelling.

3. **High-Fidelity PDF & Print System**:
   - Client-side A4 vector PDF generation via `jsPDF` and `jspdf-autotable`.
   - Browser print support (`window.print()`) with dedicated `@media print` A4 stylesheet.
   - Repeatable table headers across multi-page reports.
   - Customer and Authorized Signatory blocks with shopkeeper stamp space.

4. **Offline Archive & LocalStorage**:
   - Search by customer name, mobile number, or report number.
   - Duplicate previous reports for repeat customers.
   - JSON data backup export and restore utility.

---

## Setup & Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
