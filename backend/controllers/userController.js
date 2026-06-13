const User = require('../models/User');


const registerUser = async (req, res) => {
  const { name, password, role } = req.body;

  if (!name || !password) {
    return res.status(400).json({ success: false, message: 'Name and password are required' });
  }

  const selectedRole = role || 'user';

  try {
    
    const existingUser = await User.findOne({ name: name.trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `User with name '${name}' already exists. Please choose a different name.`,
      });
    }

    
    const user = await User.create({
      name: name.trim(),
      password,
      role: selectedRole,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const loginUser = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ success: false, message: 'Name and password are required' });
  }

  try {
    const user = await User.findOne({ name: name.trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser };
