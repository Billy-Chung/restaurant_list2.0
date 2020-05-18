const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')
const mongoose = require('mongoose') // 載入 mongoose
const Todo = require('./models/todo') // 載入 Todo model
const bodyParser = require('body-parser')
// 設定連線到 mongoDB
mongoose.connect('mongodb://localhost/restaurant_list', { useNewUrlParser: true, useUnifiedTopology: true }) 

// 取得資料庫連線狀態
const db = mongoose.connection
// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})


app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(express.static('public'), bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  Todo.find() // 取出 Todo model 裡的所有資料
    .lean() // 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .then(todos => res.render('index', { todos })) // 將資料傳給 index 樣板
    .catch(error => console.error(error)) // 錯誤處理
})

//新增餐廳
app.get('/todos/new', (req, res) => {
  return res.render('new')
})

//在資料庫新增餐廳資料的路由
app.post('/todos', (req, res) => {
  console.log(req.body)  
  if(!req.body.image.length){
    req.body.image='https://static.vecteezy.com/system/resources/previews/000/091/119/large_2x/free-restaurant-logo-on-paper-plate-vector.jpg'
  }
    const restaurant = req.body
    return Todo.create(restaurant)
      .then(() => res.redirect('/'))
      .catch((error) => console.log(error))
})

//設定詳細頁面的路由
app.get('/todos/:id', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
    .lean()
    .then((todo) => res.render('detail', { todo }))
    .catch(error => console.log(error))
})

//設定編輯路由
app.get('/todos/:id/edit', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
    .lean()
    .then((todo) => res.render('edit', { todo }))
    .catch(error => console.log(error))
})

//修改並將編輯的內容放進伺服器內
app.post('/todos/:id/edit', (req, res) => {
  const id = req.params.id
  const name = req.body.name
  const nameEn = req.body.name_en
  const category = req.body.category
  const image = req.body.image
  const location = req.body.location
  const phone = req.body.phone
  const googleMap = req.body.google_map
  const rating = req.body.rating
  const description = req.body.description
  return Todo.findById(id)
      //如果查詢成功，幫我儲存資料
      .then((restaurant) => {
        restaurant.name = name
        restaurant.nameEn = nameEn
        restaurant.category = category
        restaurant.image = image
        restaurant.location = location
        restaurant.phone = phone
        restaurant.googleMap = googleMap
        restaurant.rating = rating
        restaurant.description = description
        return restaurant.save()
      })
      //如果儲存成功，重新導向那筆的詳細頁面
      .then(() => res.redirect(`/todos/${id}`))
      .catch((error) => console.log(error))
})

//設置伺服器的監聽器
app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})

//搜尋功能的路由
app.get('/search', (req, res) => {
  const keyword = req.query.keyword
  return Todo.find()
    .lean()
    .then(todos => {
      const results = todos.filter(
        item =>
          item.name.toLowerCase().includes(keyword.toLowerCase()) ||
          item.category.toLowerCase().includes(keyword.toLowerCase())
      )
      if (results.length > 0) {
        res.render('index', { todos: results, keyword: keyword })
      } else {
        res.render('nothing', { keyword: keyword })
      }
    })
    .catch(error => console.log(error))
})