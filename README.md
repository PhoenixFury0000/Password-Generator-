# 🔐 Secure Password Generator

A modern, responsive, and secure password generator built with HTML, CSS, and JavaScript. This tool helps you create strong, random passwords to enhance your online security.

![Password Generator Preview](https://i.ibb.co/tpcyDsvR/password-generator-preview.png)

## 🌐 Live Demo

The application is deployed on Vercel and available at:  
**https://password-generator-alpha-sage-10.vercel.app/**

## ✨ Features

- **Customizable Password Length**: Generate passwords from 8 to 64 characters
- **Character Type Selection**: Choose which character types to include:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&* etc.)
- **Exclusion Options**: Option to exclude similar characters (i, l, 1, L, o, 0, O) and ambiguous characters
- **Password Strength Indicator**: Visual feedback on password strength
- **One-Click Copy**: Easily copy generated passwords to clipboard
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, attractive interface with smooth animations

## 🚀 How to Use

1. Adjust the password length using the slider or input field
2. Select which character types to include by checking the appropriate boxes
3. Optionally enable exclusions for similar or ambiguous characters
4. Click the "Generate Password" button to create a new password
5. Use the "Copy" button to copy the generated password to your clipboard
6. The password strength indicator will show the strength of your generated password

## 🛠️ Technical Details

- **Frontend**: Built with vanilla HTML, CSS, and JavaScript
- **Security**: Uses Web Crypto API for cryptographically secure random number generation
- **Responsiveness**: CSS Flexbox/Grid for layout with mobile-first approach
- **Deployment**: Hosted on Vercel for optimal performance and global accessibility
- **Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## 📁 Project Structure

```
password-generator/
├── index.html          # Main HTML document
├── style.css           # Styles and responsive design
├── script.js           # Password generation logic and UI interactions
├── README.md           # Project documentation (this file)
└── assets/             # Directory for images and icons (if any)
```

## 🔧 Local Development

To run this project locally:

1. Clone the repository:
```bash
git clone <your-repository-url>
```

2. Navigate to the project directory:
```bash
cd password-generator
```

3. Open `index.html` in your web browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

4. Visit `http://localhost:8000` in your browser

## 🛡️ Security Notes

- All password generation happens locally in your browser
- No passwords are stored or transmitted to any server
- Uses cryptographically secure random number generation (Web Crypto API)
- The application doesn't track or collect any user data

## 🌍 Browser Compatibility

This password generator works in all modern browsers including:
- Chrome (version 60+)
- Firefox (version 55+)
- Safari (version 12+)
- Edge (version 79+)

## 🎨 Customization

You can easily customize this password generator by:
- Modifying the character sets in the JavaScript code
- Adjusting the color scheme in the CSS file
- Adding new options like password patterns or passphrase generation
- Changing length constraints and default values

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👨‍💻 Author

Created by [Phoenix](https://github.com/PhoenixFury0000)

---

**Disclaimer**: This tool is provided for educational and convenience purposes. Always follow security best practices when creating and storing passwords.
```