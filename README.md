<h1>SmartCivic 🏙️</h1>

<p>
SmartCivic is a civic issue reporting and management platform that enables citizens to report local problems 
(like potholes, garbage, water issues, etc.) and helps authorities track, manage, and resolve them efficiently.
</p>

<hr>

<h2>🚀 Features</h2>
<ul>
  <li>📝 Report civic issues with description, location, and images</li>
  <li>📍 Interactive maps integration</li>
  <li>🔐 Secure user authentication (login/register)</li>
  <li>🖼️ Image uploads using Cloudinary</li>
  <li>⭐ Review and feedback system</li>
  <li>✏️ Full CRUD operations</li>
  <li>🛡️ Server-side validation and error handling</li>
  <li>🌐 Deployed online</li>
</ul>

<hr>

<h2>🛠️ Tech Stack</h2>
<ul>
  <li><b>Backend:</b> Node.js, Express.js</li>
  <li><b>Frontend:</b> EJS, Bootstrap/CSS</li>
  <li><b>Database:</b> MongoDB</li>
  <li><b>Authentication:</b> Passport.js</li>
  <li><b>Image Storage:</b> Cloudinary</li>
  <li><b>Maps:</b> Mapbox</li>
  <li><b>Deployment:</b> Render</li>
</ul>

<hr>

<h2>📂 Project Structure</h2>

<pre>
SmartCivic/
│── models/          # Database schemas
│── routes/          # Express routes
│── controllers/     # Business logic
│── views/           # EJS templates
│── public/          # Static files
│── utils/           # Helper functions
│── app.js           # Main server file
│── package.json
</pre>

<hr>

<h2>⚙️ Installation & Setup</h2>

<ol>
  <li>
    Clone the repository:
    <pre>
git clone https://github.com/Sparky-2501/02-dev-major-project-4-smartcivic.git
cd smartcivic
    </pre>
  </li>

  <li>
    Install dependencies:
    <pre>
npm install
    </pre>
  </li>

  <li>
    Create a <code>.env</code> file:
    <pre>
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
MAPBOX_TOKEN=your_mapbox_token
DB_URL=your_mongodb_url
SECRET=session_secret
    </pre>
  </li>

  <li>
    Run the project:
    <pre>
node app.js
    </pre>
  </li>

  <li>
    Open in browser:
    <pre>
http://localhost:3000
    </pre>
  </li>
</ol>

<hr>

<h2>🌍 Deployment</h2>
<ul>
  <li>Hosted on Render</li>
  <li>Configure environment variables in Render dashboard</li>
</ul>

<hr>

<h2>🎯 Future Improvements</h2>
<ul>
  <li>📱 Mobile app integration</li>
  <li>🔔 Notifications</li>
  <li>🧠 AI-based issue detection</li>
  <li>📊 Analytics dashboard</li>
</ul>

<hr>

<h2>👨‍💻 Author</h2>
<p>Prathamesh Shelke</p>

<hr>

<h2>📜 License</h2>
<p>MIT License</p>
