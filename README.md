🧑‍💼 Customer Service Setup (No Docker for PostgreSQL or pgAdmin)
✅ Install Node.js from https://nodejs.org/

✅ Install pgAdmin 4 from https://www.pgadmin.org/download/

✅ In pgAdmin:

Connect to your PostgreSQL server

Create a new database named: customer_db


✅ Install Docker Desktop from https://www.docker.com/products/docker-desktop

```
docker pull rabbitmq:3-management
docker run -d --hostname rabbitmq-local --name rabbitmq \
  -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

✅ Clone or open the customer-service project folder


* .env
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=1234
DB_NAME=customer_db
JWT_SECRET=nest

```

* Run in terminal:


```

cd customer-service
npm install



```





* Start the service:


```
npm run start:dev

```

# System Architecture
Full Flow Documentation – Customer & Order Flow (with Microservices & RabbitMQ)
________________________________________
1. Customer Registration
A new customer starts by registering on the platform. The frontend collects user details and sends them to the Customer Service.
Data Required:
•	Name
•	Email
•	Phone
•	Password
•	Address
Flow:
•	The Customer Service validates inputs.
•	Password is hashed before storing.
•	A customer document is created in the Customer Service database.
•	A JWT token is generated and returned to the frontend.
________________________________________
2. Customer Login
Existing users can log in using their email and password.
Flow:
•	User enters email and password.
•	Customer Service verifies the credentials.
•	On success, returns JWT token for accessing authenticated routes.
•	On failure, sends an error response.
________________________________________
3. Creating an Order
Once logged in, a user can create an order by selecting products. The Customer Service will not directly handle product details; instead, it will communicate with the Order Service via RabbitMQ.
Steps:
1.	Frontend sends the order request (with product IDs and quantities) to Customer Service.
2.	Customer Service:
o	Verifies the user's token.
o	Prepares the order message including:
	Customer ID
	Product list
	Quantity
	Other metadata (timestamp, order status)
o	Sends this message to a RabbitMQ queue (create_order) for the Order Service.
3.	Order Service:
o	Listens to create_order queue.
o	Validates product availability.
o	Calculates prices and totals.
o	Creates a new order record in its own database.
o	Publishes an create_order event to notify other services (if needed).
o	Sends a confirmation message back via RabbitMQ to Customer Service (if synchronous acknowledgment is needed).
4.	Customer Service:
o	Optionally updates user order history or returns the confirmation to frontend.
________________________________________
4. Fetching All Orders for a Customer (New User Orders)
To view all past orders of a customer:
Flow:
1.	Frontend requests order history from Customer Service.
2.	Customer Service:
o	Extracts customer ID from JWT.
o	Sends a request to Order Service via RabbitMQ (order_detail_queue queue), passing the customer ID.
3.	Order Service:
o	Queries its database for all orders belonging to the customer.
o	Sends back the list of orders to Customer Service through RabbitMQ.
4.	Customer Service:
o	Forwards the order list to the frontend.
________________________________________
5. Fetching a Single Order
When a user wants to view the details of a specific order:
Flow:
1.	Frontend sends a request with the Order ID to Customer Service.
2.	Customer Service:
o	Validates user identity via JWT.
o	Sends request to Order Service via RabbitMQ (single_order_queue queue).
3.	Order Service:
o	Fetches order by ID.
o	Sends back order data (including product breakdown, shipping status, etc.) through RabbitMQ.
4.	Customer Service:
o	Returns order data to frontend.
________________________________________
6. RabbitMQ Integration
RabbitMQ serves as the communication bridge between services.
Queues Used:
•	create_order → Customer sends order creation request to Order Service.
•	order_detail_queue → Customer Service requests order history.
•	single_order_queue → Request for a specific order.
Benefits:
•	Loose coupling between services.
•	Each service has its own DB (Customer DB, Order DB).
•	Services can scale independently.
•	Failure tolerance: orders can be retried if queue is persistent.
________________________________________
7. Error Handling
•	If RabbitMQ is unavailable, a fallback mechanism (retry logic or queuing locally) can be implemented.
•	If the product is unavailable or order creation fails, Order Service responds with an error.
•	Customer Service should log and communicate failure gracefully to the frontend.
________________________________________

Microservices Overview
Service	Responsibility
Customer Service	Manages customer data, login, registration, forwards order requests
Order Service	Handles order logic: creation, lookup, pricing, status
Product Service*	(Optional) Used by Order Service to check stock/prices


# 🧑‍💼 Customer Microservice with RabbitMQ & JWT Auth

This microservice handles customer registration, login, profile access, and order placement using **RabbitMQ** for inter-service communication and **JWT** for authentication.

---

## 🚀 Base URL


---

## ✅ Register a New Customer

**POST** `/api/customer`

**Request Body:**

```json
{
  "name": "ram kumar",
  "email": "abc6@gmail.com",
  "phone": "7539518521",
  "password": "123456",
  "address": "abc colony"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Account created successfully",
  "data": {
    "access_token": "<JWT_TOKEN>"
  }
}
```




## ✅ Customer Login

**POST** `/api/customer/login`

**Request Body:**

```json
{
  "email": "abc5@gmail.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "your-jwt-token-here"
  }
}

```







## ✅ Customer Profile

**GET** `/api/customer`

**Request Body:**
Headers:
Authorization: Bearer <token>




**Response:**

```json
{
  "name": "ram kumar",
  "email": "abc5@gmail.com",
  "phone": "7539518521",
  "address": "abc colony"
}

```





## ✅ All Orders (Paginated)

**GET** `/api/customer/orders?page=1&limit=10`

**Description**  
Fetches a specific order by `orderId` for the authenticated customer.  
Internally:  
- Verifies the JWT.  
- Uses RabbitMQ to request order details from the Order Service.  
- Returns the result.

**Headers:**
Authorization: Bearer <token>



**Response:**

```json
{
  "statusCode": 200,
  "page": 1,
  "limit": 10,
  "total": 12,
  "data": [
    {
      "id": "5174f6f6-07ac-4d03-b9fa-42a90a907134",
      "customerId": "6ec5430e-3eab-47b6-8ad1-7d3f15535563",
      "totalPrice": "4",
      "status": "pending",
      "createdAt": "2025-05-15T15:38:53.639Z",
      "orderItems": [
        {
          "id": "6253462d-d280-4e17-9862-5408a95519c9",
          "productId": "d3a87d0f-ce3e-4170-9fc6-21bfd5a5cbe7",
          "quantity": 1,
          "unitPrice": "4",
          "totalPrice": "4",
          "product": {
            "name": "Banana",
            "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvuFWmgStX6zF38A7ZufXtDXTlUag-rcKnew&s"
          }
        }
      ]
    }
  ]
}





```

## ✅ Single Order by ID

**GET** `/api/customer/order 5174f6f6-07ac-4d03-b9fa-42a90a907134`

**Description**  
Fetches a specific order by `orderId` for the authenticated customer.  
Internally:  
- Verifies the JWT.  
- Uses RabbitMQ to request order details from the Order Service.  
- Returns the result.

**Headers:**
Authorization: Bearer <token>



**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "5174f6f6-07ac-4d03-b9fa-42a90a907134",
    "customerId": "6ec5430e-3eab-47b6-8ad1-7d3f15535563",
    "totalPrice": "4",
    "status": "pending",
    "createdAt": "2025-05-15T15:38:53.639Z",
    "orderItems": [
      {
        "id": "6253462d-d280-4e17-9862-5408a95519c9",
        "productId": "d3a87d0f-ce3e-4170-9fc6-21bfd5a5cbe7",
        "quantity": 1,
        "unitPrice": "4",
        "totalPrice": "4",
        "product": {
          "name": "Banana",
          "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvuFWmgStX6zF38A7ZufXtDXTlUag-rcKnew&s"
        }
      }
    ]
  }
}

```










## ✅ Create Order

**POST** `/api/customer/order`

**Description**  
Fetches a specific order by `orderId` for the authenticated customer.  
Internally:  
- Verifies the JWT.  
- Uses RabbitMQ to request order details from the Order Service.  
- Returns the result.


**Headers:**
Authorization: Bearer <token>

**Request Body:**

```json
{
  "orderItems": [
    { "productId": "fdeb9954-cfab-4342-a772-8e4ea033560e", "quantity": 2 },
    { "productId": "af06c7c9-fe16-49c1-aa21-8fd143fd018f", "quantity": 1 }
  ]
}
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Order placed successfully",
  "data": {
    "id": "5c36040a-8945-490d-b3c3-e35b63d7f752",
    "customerId": "6ec5430e-3eab-47b6-8ad1-7d3f15535563",
    "totalPrice": 28,
    "status": "pending",
    "createdAt": "2025-05-15T17:15:10.839Z",
    "orderItems": [
      {
        "id": "024019e6-3392-4124-8fc2-c450776629dd",
        "productId": "fdeb9954-cfab-4342-a772-8e4ea033560e",
        "quantity": 2,
        "unitPrice": 4,
        "totalPrice": 8
      },
      {
        "id": "80533640-80f4-448e-871b-074528f8fcd1",
        "productId": "af06c7c9-fe16-49c1-aa21-8fd143fd018f",
        "quantity": 1,
        "unitPrice": 20,
        "totalPrice": 20
      }
    ]
  }
}






```