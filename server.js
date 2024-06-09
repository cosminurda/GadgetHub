const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conectare la MongoDB
mongoose.connect('mongodb://localhost:27017/gadgethub', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Schema și modelul pentru utilizatori
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Schema și modelul pentru produse
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

// Schema și modelul pentru membrii echipei
const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, required: true }
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

// Endpoint pentru înregistrare
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  let user = await User.findOne({ email });
  if (user) return res.status(400).send('User already registered.');

  user = new User({ email, password });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  res.send('User registered successfully');
});

// Endpoint pentru autentificare
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = jwt.sign({ _id: user._id }, 'jwtPrivateKey');
  res.send({ token });
});

// Endpoint pentru a adăuga un produs nou
app.post('/products', async (req, res) => {
  const { name, price, image } = req.body;

  const newProduct = new Product({ name, price, image });
  await newProduct.save();
  res.send(newProduct);
});

// Endpoint pentru a obține lista produselor
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

// Endpoint pentru a șterge un produs
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;

  await Product.findByIdAndDelete(id);
  res.send({ message: 'Product deleted' });
});

// Endpoint pentru a adăuga un membru nou în echipă
app.post('/team', async (req, res) => {
  const { name, role, image } = req.body;

  const newMember = new TeamMember({ name, role, image });
  await newMember.save();
  res.send(newMember);
});

// Endpoint pentru a obține lista membrilor echipei
app.get('/team', async (req, res) => {
  const team = await TeamMember.find();
  res.send(team);
});

// Endpoint pentru a șterge un membru din echipă
app.delete('/team/:id', async (req, res) => {
  const { id } = req.params;

  await TeamMember.findByIdAndDelete(id);
  res.send({ message: 'Team member deleted' });
});

// Servirea fișierelor HTML statice
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
