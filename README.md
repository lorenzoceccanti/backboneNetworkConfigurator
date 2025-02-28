# ANAWS PROJECT 1

## Project Members
- Alice Orlandini
- Alessandro Ascani
- Lorenzo Ceccanti

## Backbone Network Configuration

This project automates the configuration of **Arista routers** using **ContainerLab** and **Python** with **Jinja2**.

### Description

The system enables the automatic generation of initial configuration files for each router in the network, including:

- **IP addresses for interfaces**
- **Autonomous System (AS) numbers**
- **BGP neighbors**
- **DHCP configurations**

Additionally, it manages the configuration of peering relationships and routing policies between different **Autonomous Systems (ASs)**.

### Starting the Project

To start the automated configuration process, run:

```sh
./deploy.sh [build_frontend]
```

- If the `build_frontend` argument is provided, the frontend interface will also be built.
- The server will be listening on **port 5000**.

#### Development Mode

##### Backend (Flask)

1. Activate the virtual environment:
   ```sh
   source .venv/bin/activate  # Linux/macOS
   .venv\Scripts\activate  # Windows
   ```

2. Ensure you are using a **Python version no higher than 12**.

3. Install the dependencies:
   ```sh
   pip install -r requirements.txt
   ```

4. Start the backend:
   ```sh
   python3 ./app.py
   ```

##### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```

2. Install the dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

- The frontend will be available on **port 3000**.

### Technologies Used

- **ContainerLab** for managing router topology
- **Python + Jinja2** for automatic configuration file generation
- **Flask** for the backend interface
- **Next.js** for the frontend interface

### Supported Features

- **Automatic provisioning** of Arista routers
- **BGP configuration** with AS peering
- **DHCP management** for local networks
- **Fast network deployment** using ContainerLab
