// src/ProductForm.js

import React, { useState } from 'react';
import axios from 'axios';

const ProductForm = () => {
  const [productName, setproductName] = useState('');
  const [productCode, setproductCode] = useState('');
  const [sku, setSKU] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/add-product', {
        productName,
        productCode,
        sku,
        price,
        description
      });
      alert(response.data.message);
      setproductName('');
      setproductCode('');
      setSKU('');
      setPrice('');
      setDescription('');
    } catch (error) {
      alert('Error adding product. Please try again.');
    }
  };

  return (
    <div>
      <h2>Add a New Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setproductName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Product Code:</label>
          <input
            type="text"
            value={productCode}
            onChange={(e) => setproductCode(e.target.value)}
            required
          />
        </div>
        <div>
          <label>SKU:</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSKU(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            cols={5}
          />
        </div>
        
        <div>
          <button type="submit">Add Product</button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
