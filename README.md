# ScriptHelper Project

**ScriptHelper** is a comprehensive application designed to assist writers in creating and managing their stories, scripts, and related content. The project is composed of several interconnected components, each tailored to handle specific aspects of the application.

## Project Components

1. **Backend API (GraphQL)**: The core service handling data operations, built with Python and Flask.
2. **Frontend Web Application**: A user-facing application built with Next.js for an interactive experience.
3. **Agent for Processing Tasks**: A Python-based service that processes background tasks, such as AI-driven text generation.
4. **API Documentation**: Automatically generated documentation for the GraphQL API.
5. **Admin Application**: An administrative interface for managing users, projects, and platform settings.
6. **Redis**: In-memory data structure store used for caching and as a message broker.
7. **MongoDB**: NoSQL database for storing application data.
8. **RabbitMQ**: Message broker facilitating communication between services.

## Project Structure

- `backend/`: GraphQL API service built with Python and Flask
- `webapp/`: Next.js-based frontend application
- `agent/`: Python-based agent for processing background tasks
- `api-docs/`: Generated API documentation
- `admin/`: Admin application for managing the platform
- `redis/`: Redis server setup
- `mongo-server/`: MongoDB server setup
- `queue-server/`: RabbitMQ server setup

## Development Environment Setup

### Prerequisites

- **General**:
  - Python 3.8+
  - Node.js 14+
  - Docker and Docker Compose
  - Git

- **Services**:
  - MongoDB
  - Redis
  - RabbitMQ

- **LLM Providers**:
  - OpenAI, will need an API key
  - Anthropic, will need an API key

### Component Setup

Basic overview:
1. You'll first need to run the component services (Redis, MongoDB, RabbitMQ). You can use the individual docker-deploy scripts or the start-services.sh script.
2. Then you'll need to configure the .env file in each component.
3. Generate the encryption key for the backend and add it to the .env file.
4. Seed the database for the backend.
5. Configure the LLM providers in the backend and agent.

#### Redis Setup

1. Navigate to the `redis/` directory.
2. Deploy Redis using Docker:
   ```bash
   ./docker-deploy
   ```

#### MongoDB Setup

1. Navigate to the `mongo-server/` directory.
2. Deploy MongoDB using Docker:
   ```bash
   ./docker-deploy
   ```

#### RabbitMQ Setup

1. Navigate to the `queue-server/` directory.
2. Deploy RabbitMQ using Docker:
   ```bash
   ./docker-deploy
   ```

#### Backend Setup

1. Navigate to the `backend/` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env` and set the required variables.
   - Make sure to set the APP_PATH to the project root
4. Generate encryption keys:
   Generate ENCRYPTION_KEY and JWT_SECRET_KEY using the utility script and add them to the .env file
   ```bash
   python src/cmd.py generateKey
   ```
5. Seed the database:
   Run the VSCode debugger or,
   ```bash
   python src/cmd.py seedDatabase
   ```
   This will create an admin user (admin@example.com/password) and a regular user (user@example.com/password)
6. Run the development server:
   ```bash
   python src/run.py
   ```

##### LLM Providers Configuration

Configure supported LLM providers in `src/main/config/settings.py`. Supported providers include:

- OpenAI
- Anthropic

#### Frontend Web Application Setup

1. Navigate to the `webapp/` directory.
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env.local` and set the required variables.
4. Start the backend server so that the graphql types can be generated
   ```bash
   cd backend
   python src/run.py
   ```
5. Run the graphql codegen to generate the types
   ```bash
   npm run types-generate
   ```
6. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Agent Setup

1. Navigate to the `agent/` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env` and set the required variables, including credentials for LLM providers.
4. Run the agent:
   ```bash
   python src/agent.py
   ```

##### LLM Providers Configuration

Configure supported LLM providers in `src/config/llms.py`. Supported providers include:

- OpenAI
- Anthropic

Ensure credentials and endpoints are correctly set in the `.env` file.

#### Admin Application Setup

1. Navigate to the `admin/` directory.
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env.local` and set the required variables.
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Running the Complete Application Locally

1. **Start Required Services**:
   - Deploy MongoDB, Redis, and RabbitMQ using their respective Docker deployment scripts or ./start-services.sh
   
2. **Start Agent**:
   - Run with the VSCode debugger, or

   ```bash
   cd agent
   python src/agent.py
   ```

3. **Start Backend Server**:
   - Run with the VSCode debugger, or
   
   ```bash
   cd backend
   python src/run.py
   ```

4. **Start Frontend Development Server**:
   - Run with the VSCode debugger, or

   ```bash
   cd webapp
   npm run dev
   # or
   yarn dev
   ```
   
5. **Start Admin Application Development Server**:
   ```bash
   cd admin
   npm start
   # or
   yarn start
   ```
   
You should now be able to access:
- **Main Application**: [http://localhost:3000](http://localhost:3000)
- **Admin Application**: [http://localhost:3001](http://localhost:3001)

## Deployment

TODO

## Additional Notes

- **Environment Variables**: Ensure all necessary environment variables are set for each component. Refer to each subproject's README for specific variables.
- **Security**: For production deployments, implement security measures such as HTTPS, proper authentication, and access controls.
- **Scaling**: The Agent component can be scaled by deploying additional instances to handle increased task loads.
- **Logging**: Monitor logs located in respective `logs/` directories for each service to troubleshoot issues.
- **Documentation**: Update and maintain API documentation using the provided scripts to ensure it reflects the latest API changes.
