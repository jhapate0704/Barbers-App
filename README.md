 # ✂️ TrimSync - Next-Gen Salon & Barbershop Management

    TrimSync is a full-stack, real-time marketplace and management platform designed to connect customers with top-
  tier salons and barbershops. It features a stunning, dynamic user interface, real-time queue tracking, and dedicated
  dashboards for both customers and salon owners.

    ## 🌟 Key Features

    ### For Customers
    - **Marketplace Discovery:** Browse local salons and barbershops with real-time "Live Shop Floor" tracking.
    - **Live Queue System:** Powered by WebSockets (Socket.io), see instantly if a chair is occupied or open without
  refreshing the page.
    - **Seamless Booking:** A step-by-step, interactive booking wizard to select services, choose professionals, and
  lock in appointment times.
    - **Customer Dashboard:** Track past and upcoming appointments, manage profile settings, and leave reviews.

    ### For Salon Owners
    - **Owner Dashboard:** A centralized control panel to manage daily operations.
    - **Real-Time Chair Management:** Mark chairs as occupied, free, or assign them to specific bookings to keep the
  Live Shop Floor accurate for incoming customers.
    - **Service & Portfolio Management:** Update pricing, services, operating hours, and upload portfolio images (via
  Cloudinary integration) to attract more clients.
    - **Customer Records:** Track client history and add private notes for personalized experiences.

    ## 🏗️ Technology Stack

    TrimSync is built on the **MERN** stack, highly optimized for real-time interactivity.

    **Frontend:**
    - React 18 (Bootstrapped with Vite)
    - TailwindCSS (Styling & Micro-animations)
    - React Router DOM (Client-side routing)
    - Socket.io-client (Real-time events)
    - Lucide React & React Icons (Vector iconography)

    **Backend:**
    - Node.js & Express.js
    - MongoDB & Mongoose (Database & ORM)
    - Socket.io (WebSocket server)
    - JSON Web Tokens (JWT) (Secure Authentication)
    - Cloudinary (Image storage & delivery)

    ## 🚀 Getting Started

    ### Prerequisites
    Make sure you have Node.js and MongoDB installed on your local machine, or a MongoDB Atlas URI ready.

    ### 1. Clone & Install Dependencies
    First, install the dependencies for both the frontend and backend.

    ```bash
    # Install backend dependencies
    cd server
    npm install

    # Install frontend dependencies
    cd ../client
    npm install

  ### 2. Environment Variables
  Create a  .env  file in the  server  directory and add the following keys:

    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    CLOUDINARY_CLOUD_NAME=your_cloudinary_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret

  ### 3. Run the Application
  You'll need two separate terminal windows to run both ends of the stack.

  Terminal 1 (Backend):
    cd server
    npm run dev
    # The server will start on http://localhost:5000

  Terminal 2 (Frontend):

    cd client
    npm run dev
    # Vite will spin up the frontend on http://localhost:5173


  ## 🛡️ Security

  • Authentication: All protected API routes are secured via JWT middleware.
  • Passwords: Handled securely via bcrypt hashing before saving to the database.
  • Component Splitting: Frontend architecture is rigorously split and scoped to prevent unauthorized rendering.
