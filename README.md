# AUTO-COMPLETE

Ability to provide auto-complete suggestions for a text field that appears in a set of records, when a user provides just the first few characters to search

SA Maintainer: **[Insert Name]**
SA Author: **[Insert Name]**
Time to setup: 20 mins
Time to execute: 5 mins

## Description

This proof shows how MongoDB Atlas Full Text Search (FTS) can enable autocomplete suggestions for a text field when a user provides the first 3 or more characters of a search query. We'll use the **`movies`** collection from the **`sample_mflix`** database and two distinct search indexes. The demo is a lightweight, self-contained **Node.js** application that serves a web interface for searching. The backend uses the official MongoDB Node.js driver to execute the `$search` aggregation pipelines.



***

## Setup

### 1. Configure MongoDB Atlas ☁️

1.  **Create a Cluster:** Log in to your Atlas account and create an **M10** or larger cluster in a region of your choice. Ensure your cluster is running a recent version of MongoDB (6.0 or higher is recommended).
2.  **Load Sample Data:** Once the cluster is provisioned, click the ellipsis `...` and select **Load Sample Dataset**. This will add the **`sample_mflix`** database and its collections, which we'll use for the demo.
3.  **Create a Database User:**
    * Go to the **Database Access** section under **Security** and click **Add New Database User**.
    * Create a user with a strong password (e.g., **`main_user`**). Make a note of the password you specify.
    * Grant the user **`Read and write to any database`** privileges.
4.  **Whitelist Your IP Address:**
    * Go to the **Network Access** section under **Security**.
    * Click **Add IP Address** and choose **Add Current IP Address**. This allows your local machine to connect to the cluster.

---

### 2. Create the Search Indexes 🔍

This demo requires **two distinct search indexes** for optimal performance: one for autocomplete and one for full-text search.

#### **Index 1: Autocomplete Index**
This index is optimized for fast "starts-with" queries on the movie titles.

* Go to your cluster's **Search** tab.
* Click **Create Search Index**.
* Select **JSON Editor** and click **Next**.
* Choose `sample_mflix` as the database and `movies` as the collection.
* Name the index **`ix_autocomplete`**.
* Copy and paste the following index definition into the JSON editor:

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

* Click **Create Index**.

#### **Index 2: General-Purpose Text Index**
This index is used for the main search functionality, searching both the `title` and `fullplot` fields for relevant movie information.

* Go to your cluster's **Search** tab.
* Click **Create Search Index**.
* Select **JSON Editor** and click **Next**.
* Choose `sample_mflix` as the database and `movies` as the collection.
* Name the index **`title_fullplot`**.
* Copy and paste the following index definition into the JSON editor:

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

* Click **Create Index**. Wait for both indexes to finish building.

---

### 3. Configure the Node.js Application 💻

1.  **Get the Codebase:**
    * In your terminal, create a project folder and navigate into it.
    * Create the necessary files and subfolders: **`.env`**, **`package.json`**, **`server.js`**, **`public/index.html`**, and **`public/css/fts-stitch.css`**. You can copy-paste the code for these files from the previous steps.
2.  **Set the Connection String:**
    * Go to your **Databases** tab in the Atlas console and click **Connect**.
    * Choose **Connect your application**.
    * Copy the provided **MongoDB Connection String**.
    * Paste the connection string into the **`.env`** file in your project, replacing the placeholders with your username, password, and cluster name. The file should look like this:
    
    ```
    MONGO_URI="mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority"
    ```
3.  **Install Dependencies:**
    * In the terminal, with the `mongodb-search-demo` folder as your current directory, install the required npm packages by running:
    
    ```bash
    npm install
    ```

***

## Execution

### 1. Run the Application

1.  In the terminal, start the server with this command:
    
    ```bash
    npm start
    ```
    
    You should see a message in the terminal confirming the server is running.
    
    ```
    Successfully connected to MongoDB Atlas!
    Server is running at http://localhost:3000
    ```

2.  Open your web browser and go to **`http://localhost:3000`**. You will see the movie search interface.

### 2. Test Autocomplete and Search

1.  Start typing a movie title (e.g., "**the**") into the search box. After the first three characters, a dropdown will appear with autocomplete suggestions. This uses the **`ix_autocomplete`** index.
2.  Use the arrow keys to navigate the suggestions or press Enter to search based on the text in the input box.
3.  The search results will be displayed below the search bar, ranked by relevance. This uses the **`title_fullplot`** index to find matches in both the `title` and `fullplot` fields.