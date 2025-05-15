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

**Response:**

```json
{
  "statusCode": 201,
  "message": "Account created successfully",
  "data": {
    "access_token": "<JWT_TOKEN>"
  }
}




## ✅ Customer Login

**POST** `/api/customer/login`

**Request Body:**

```json
{
  "email": "abc5@gmail.com",
  "password": "123456"
}


**Response:**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "your-jwt-token-here"
  }
}









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






