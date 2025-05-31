# BudgetLink (W.I.P)💰

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6?style=for-the-badge&logo=amazon-dynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![Amazon S3](https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)](https://aws.amazon.com/s3/)

A modern, shareable budgeting and expense tracking web application that lets you create and share budgets without requiring user accounts. Think of it as "PCPartPicker for budgets" - create a budget, get a shareable link, and collaborate with others!

## ✨ Features

### 🔐 Secure & Shareable Budgets
- Generate human-readable budget URLs (e.g., `budgetlink.com/happy-blue-tiger`)
- Optional password protection for sensitive budgets
- View-only access tokens for sharing with stakeholders
- No account required - just create and share!

### 💸 Expense Management
- Add one-time or recurring expenses
- Dynamic category creation
- Real-time budget tracking
- Smart expense categorization

### 📊 Visual Analytics
- Interactive charts and graphs
- Budget vs. actual spending comparisons
- Category-wise expense breakdown
- Cash flow projections
- Threshold alerts (email/browser notifications)

### 📤 Export & Reports
- Download transactions in multiple formats
  - PDF reports
  - CSV exports
  - Excel spreadsheets
- Customizable report templates
- Summary dashboards

## 🛠 Tech Stack

### Frontend
- React with TypeScript
- Recharts/Chart.js for visualizations
- Modern UI components
- Responsive design

### Backend (AWS Serverless)
- API Gateway for RESTful endpoints
- Lambda functions for business logic
- DynamoDB (single-table design)
- S3 for static assets

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- AWS CLI configured
- Terraform for infrastructure

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd infra
terraform init
terraform apply
```

## 📝 Project Structure
```
BudgetLink/
├── frontend/          # React frontend application
├── infra/            # Terraform infrastructure code
│   └── modules/      # Reusable Terraform modules
└── README.md
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- Inspired by PCPartPicker's shareable build system
- Built with modern web technologies
- Powered by AWS serverless architecture 