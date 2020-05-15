const mongoose = require('mongoose')
const Schema = mongoose.Schema
const todoSchema = new Schema({
    results: {
        id: Number,
        name: string,
        name_en: string,
        category: string,
        image: string,
        location: string,
        phone: Number,
        google_map: string,
        rating: Number,
        description: string
    }
})

module.exports = mongoose.model('Todo', todoSchema)