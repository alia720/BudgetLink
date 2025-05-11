# BudgetLink

A login-free budgeting & expense-tracking web app with shareable, human-friendly URLs.

## Features

- Create and manage budgets without requiring login
- Add, edit, and delete expenses
- Share budgets via URLs with optional password protection
- Interactive charts and visualizations
- Export data in multiple formats
- Threshold alerts and notifications

## Tech Stack

- Frontend: React + Vite
- Backend: AWS Lambda + API Gateway
- Database: DynamoDB
- Infrastructure: Terraform
- Containerization: Docker
- Local Development: LocalStack

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- AWS CLI configured with appropriate credentials
- Terraform CLI

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/BudgetLink.git
   cd BudgetLink
   ```

2. Install dependencies:
   ```bash
   # Frontend dependencies
   cd frontend
   npm install
   ```

3. Start local development environment:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - LocalStack: http://localhost:4566

## Project Structure

```
BudgetLink/
├── frontend/           # React frontend application
├── infra/             # Terraform infrastructure code
│   ├── modules/       # Reusable Terraform modules
│   └── environments/  # Environment-specific configurations
└── docker/           # Docker configuration files
```

## Development

### Frontend Development

```bash
cd frontend
npm run dev
```

### Infrastructure Deployment

```bash
cd infra
terraform init
terraform plan -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
```

## License

MIT 