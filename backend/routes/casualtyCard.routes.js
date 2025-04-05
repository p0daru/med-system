// routes/casualtyCard.routes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CasualtyCard = require('../models/CasualtyCard.model'); // Import the updated model

// --- Middleware for validating MongoDB ObjectIds in route parameters ---
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.warn(`Invalid ObjectId received in URL parameter: ${id}`);
        // Return a 400 Bad Request if the ID format is incorrect
        return res.status(400).json({ message: "Невалідний формат ID запису" });
    }
    next(); // Proceed to the route handler if ID format is valid
};

// --- POST /api/casualty-cards/ --- Create a new casualty card
router.post('/', async (req, res) => {
    // Log the incoming request body for debugging (consider redacting sensitive PII in production logs)
    console.log('Received POST /api/casualty-cards/ request body:', JSON.stringify(req.body, null, 2));

    try {
        // Create a new Mongoose document directly from the request body.
        // Mongoose will only pick fields defined in the schema.
        // Frontend is responsible for sending data structured according to the schema.
        const newCard = new CasualtyCard(req.body);

        // Mongoose's .save() method automatically runs schema validations.
        const savedCard = await newCard.save();

        console.log('Casualty Card created successfully with ID:', savedCard._id);
        // Respond with 201 Created status and the newly created document.
        // Frontend uses the returned _id to navigate to the edit page.
        res.status(201).json(savedCard);

    } catch (error) {
        console.error('Error creating casualty card:', error);
        if (error.name === 'ValidationError') {
            // If Mongoose validation fails, collect error messages.
            const messages = Object.values(error.errors).map(val => val.message);
            console.warn('Validation Errors:', messages);
            return res.status(400).json({ message: "Помилка валідації даних", errors: messages });
        }
        // Handle other potential server errors during creation.
        res.status(500).json({ message: "Помилка сервера при створенні картки", error: error.message });
    }
});

// --- GET /api/casualty-cards/ --- Get a list of casualty cards (with optional search)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query; // Get search term from query parameters (e.g., /api/casualty-cards?search=Smith)
        let query = {}; // Mongoose query object, initially empty (find all)

        if (search && search.trim() !== '') {
            // Use case-insensitive regex search on indexed fields if a search term is provided.
            // '^' anchors the search to the beginning of the string.
            // Escape special regex characters in the user input to prevent errors/injection.
            const escapedSearch = search.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const searchRegex = new RegExp('^' + escapedSearch, 'i');

            // Search across multiple relevant fields
            query = {
                $or: [
                    { patientFullName: searchRegex },
                    { individualNumber: searchRegex },
                    { last4SSN: searchRegex }
                    // Add more fields here if needed, e.g., { unit: searchRegex }
                ]
            };
            console.log(`Executing search with regex: ${searchRegex}`);
        } else {
             console.log('Fetching all casualty cards (no search term).');
        }

        // Execute the find query
        const cards = await CasualtyCard.find(query)
            .sort({ createdAt: -1 }) // Sort by creation date, newest first (default)
            .select('-__v')           // Exclude the __v version key from the result
            .lean();                  // Use .lean() for faster read operations (returns plain JS objects)

        console.log(`Found ${cards.length} casualty cards.`);
        res.status(200).json(cards);

    } catch (error) {
        console.error('Error fetching casualty cards:', error);
        res.status(500).json({ message: "Помилка сервера при отриманні списку карток", error: error.message });
    }
});

// --- GET /api/casualty-cards/:id --- Get a single casualty card by its MongoDB _id
router.get('/:id', validateObjectId, async (req, res) => { // Apply ObjectId validation middleware
    const { id } = req.params;
    console.log(`Received GET /api/casualty-cards/${id} request.`);

    try {
        const card = await CasualtyCard.findById(id)
            .select('-__v') // Exclude the version key
            .lean();        // Return plain JS object

        if (!card) {
            console.log(`Casualty Card not found for ID: ${id}`);
            return res.status(404).json({ message: "Картку з таким ID не знайдено" });
        }

        console.log(`Successfully fetched casualty card with ID: ${id}`);
        res.status(200).json(card); // Respond with the found card data

    } catch (error) {
        console.error(`Error fetching casualty card with ID ${id}:`, error);
        res.status(500).json({ message: "Помилка сервера при отриманні картки", error: error.message });
    }
});

 // --- PUT /api/casualty-cards/:id --- Update an existing casualty card by ID
 router.put('/:id', validateObjectId, async (req, res) => { // Apply ObjectId validation middleware
     const { id } = req.params;
     const updateData = req.body; // Get the update payload from the request body

     console.log(`Received PUT /api/casualty-cards/${id} request.`);
     // Log update data carefully in production due to PII
     // console.log('Update data received:', JSON.stringify(updateData, null, 2));

     // --- Data Sanitization ---
     // Prevent modification of certain fields by explicitly removing them from the update payload.
     // While findByIdAndUpdate won't update _id, explicitly removing helps clarity and safety.
     // individualNumber is often immutable after creation, so we prevent updates here, aligning with frontend logic.
     delete updateData._id;
     delete updateData.createdAt;
     delete updateData.updatedAt;
     delete updateData.__v;
     delete updateData.individualNumber; // Prevent changing the individual number via update

     try {
         // Find the document by ID and update it with the sanitized data.
         const updatedCard = await CasualtyCard.findByIdAndUpdate(
             id,
             { $set: updateData }, // Use $set to update only the fields provided in updateData
             {
                 new: true, // Return the modified document rather than the original
                 runValidators: true, // Ensure schema validations run on update
                 context: 'query',    // Necessary for certain validation contexts
                 omitUndefined: true  // Prevents $unset behavior for fields not in updateData
             }
         ).select('-__v').lean(); // Exclude version key and return plain object

         if (!updatedCard) {
             console.log(`Casualty Card not found for update with ID: ${id}`);
             return res.status(404).json({ message: "Картку з таким ID не знайдено для оновлення" });
         }

         console.log('Casualty Card updated successfully:', updatedCard._id);
         res.status(200).json(updatedCard); // Respond with the updated document

     } catch (error) {
         console.error(`Error updating casualty card with ID ${id}:`, error);
         if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             console.warn('Validation Errors on Update:', messages);
             return res.status(400).json({ message: "Помилка валідації даних при оновленні", errors: messages });
         }
         if (error.name === 'CastError') {
             // Handle errors where data type doesn't match schema (e.g., string where number expected)
             console.warn(`Cast Error on Update (Path: ${error.path}, Value: ${error.value}):`, error.message);
             return res.status(400).json({ message: `Некоректний тип даних для поля: ${error.path}`, error: error.message });
         }
         // Handle other potential server errors during update.
         res.status(500).json({ message: "Помилка сервера при оновленні картки", error: error.message });
     }
 });

// --- DELETE /api/casualty-cards/:id --- Delete a casualty card by ID
router.delete('/:id', validateObjectId, async (req, res) => { // Apply ObjectId validation middleware
    const { id } = req.params;
    console.log(`Received DELETE /api/casualty-cards/${id} request.`);

    try {
        const deletedCard = await CasualtyCard.findByIdAndDelete(id);

        if (!deletedCard) {
            console.log(`Casualty Card not found for deletion with ID: ${id}`);
            return res.status(404).json({ message: "Картку з таким ID не знайдено для видалення" });
        }

        console.log('Casualty Card deleted successfully:', id);
        // Respond with a success message and the ID of the deleted card.
        res.status(200).json({ message: "Картку успішно видалено", id: id });

    } catch (error) {
        console.error(`Error deleting casualty card with ID ${id}:`, error);
        res.status(500).json({ message: "Помилка сервера при видаленні картки", error: error.message });
    }
});

module.exports = router; // Export the router to be used in the main server file