# AUTO-COMPLETE

Ability to provide auto-complete suggestions for a text field that appears in a set of records, when a user provides just the first few characters to search.

**Author**: Luca Vavassori

**Estimated Setup Time**: 20 mins

**Estimated Execution Time**: 5 mins 

## Description

This project showcases a proof-of-concept for a high-performance autocomplete feature using **MongoDB Atlas Full-Text Search (FTS)**. The application utilizes two distinct search indexes to demonstrate both fast prefix-based suggestions and comprehensive full-text search. The demo is built as a lightweight Node.js application, making it easy to deploy and share across the team.

---

## Setup

### 1. MongoDB Atlas Environment Configuration ☁️

1.  **Create a Cluster:** Provision an **M10** or larger cluster in a suitable cloud region.
2.  **Load Sample Data:** From your cluster's overview page, load the **`sample_mflix`** dataset.
3.  **Configure Database Access:**
    * Create a dedicated database user (e.g., **`demo_user`**) with a strong password. Grant it **`Read and write to any database`** privileges.
    * Add your company's network IP addresses or a specific IP address to the **Network Access** IP whitelist to enable connectivity.

---

### 2. Search Index Creation 🔍

This demo relies on two specialized search indexes. You can create them using the Atlas console's JSON Editor.

1.  **`ix_autocomplete` (Autocomplete Index):** This index is optimized for fast, prefix-based queries on the `title` field.
    * **Database:** `sample_mflix`
    * **Collection:** `movies`
    * **Index Definition:**
        ```json
        {
          "mappings": {
            "dynamic": false,
            "fields": {
              "title": [
                {
                  "type": "autocomplete",
                  "foldDiacritics": false,
                  "maxGrams": 7,
                  "minGrams": 3,
                  "tokenization": "nGram"
                }
              ]
            }
          }
        }
        ```
2.  **`title_fullplot` (Full-Text Search Index):** This index handles general-purpose text search across the `title` and `fullplot` fields, providing relevance-based ranking.
    * **Database:** `sample_mflix`
    * **Collection:** `movies`
    * **Index Definition:**
        ```json
        {
          "mappings": {
            "dynamic": true,
            "fields": {
              "fullplot": {
                "type": "string"
              },
              "title": {
                "type": "string"
              }
            }
          }
        }
        ```

---

### 3. Application Deployment 💻

1.  **Clone the Repository:**
    ```bash
    git clone [repository URL]
    cd [repository-name]
    ```
2.  **Configure Environment Variables:**
    * Create a `.env` file in the root directory of the project. This file is ignored by Git to prevent exposing credentials.
    * Populate the file with your MongoDB Atlas connection string. You can find this in the Atlas console under **Connect > Connect your application**.
        ```
        MONGO_URI="mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority"
        ```
3.  **Install Dependencies and Run:**
    * Install the Node.js dependencies: `npm install`
    * Start the server: `npm start`
    * The application will be accessible at `http://localhost:3000`.

---

## Usage

1.  **Autocomplete:** Type at least three characters into the search bar. The application will show real-time suggestions from the `ix_autocomplete` index.
2.  **Full Search:** Press **Enter** or click the search icon to perform a full-text search. The results, powered by the `title_fullplot` index, will be ranked by relevance and displayed below the search bar.
