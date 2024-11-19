
const allTechnologies = [
    /// Programming Languages
    "Python", "Java", "JavaScript", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go", "Rust",
    
    // Frameworks and Libraries
    // Web Frameworks
    "Django", "Flask", "FastAPI", "Ruby on Rails", "Laravel", "Spring", "Express.js", "ASP.NET",
    
    // JavaScript Frameworks/Libraries  
    "React", "Angular", "Vue.js", "Node.js", "jQuery", "D3.js", "Gatsby", "Next.js",
    
    // Data Science and Machine Learning
    "NumPy", "Pandas", "Matplotlib", "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "Spark", "Hadoop",
    
    // Other Libraries
    "Flask-SQLAlchemy", "Django REST Framework", "Requests", "Beautiful Soup", "Scrapy", "Celery", "Redis",
    
    // Databases
    "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Oracle", "Microsoft SQL Server", "Redis", "Cassandra",
    
    // Cloud Platforms  
    "AWS", "Google Cloud", "Microsoft Azure", "Heroku", "DigitalOcean", "IBM Cloud",
    
    // Containerization and Orchestration
    "Docker", "Kubernetes", "Ansible", "Terraform", "Vagrant",
    
    // Version Control
    "Git", "GitHub", "GitLab", "Bitbucket",
    
    // Collaboration and Project Management
    "Jira", "Trello", "Asana", "Slack", "Discord",
    
    // Testing Frameworks
    "unittest", "pytest", "Selenium", "Cypress", "Jest", "Mocha",
    
    // Deployment and Monitoring
    "Nginx", "Apache", "Gunicorn", "Supervisor", "Sentry", "Datadog", "New Relic",
    
    // Integrated Development Environments (IDEs)
    "PyCharm", "Visual Studio Code", "Sublime Text", "Atom", "Vim", "Emacs",
    
    // HTML and CSS
    "HTML", "CSS",
    
    // CSS Frameworks
    "Bootstrap", "Foundation", "Bulma", "Tailwind CSS", "Materialize", "Semantic UI",
    
    // Miscellaneous
    "Jupyter Notebook", "Elasticsearch", "RabbitMQ", "Kafka", "Grafana", "Prometheus"
];


const Cities = [
    "All over India",
    "Bangalore",
    "Hyderabad",
    "Mumbai",
    "Chennai",
    "Delhi NCR (includes Gurgaon and Noida)",
    "Pune",
    "Kolkata",
    "Coimbatore",
    "Kochi",
    "Nagpur",
    "Lucknow",
    "Jaipur",
    "Bhubaneswar",
    "Chandigarh",
    "Surat",
    "Visakhapatnam",
    "Agra",
    "Mysuru",
    "Patna",
    "Ghaziabad",
    "Faridabad",
    "Nashik",
    "Thiruvananthapuram",
    "Ahmedabad",
    "Indore",
    "Jamshedpur"
];

const error_types = [
        // User Interface (UI) Issues
        "Broken Layouts",
        "Misaligned Elements",
        "Inconsistent Font Sizes",
        "Missing Images",
        "Incorrect Colors",
        "Overlapping Text or Images",
        "Unresponsive Design",
        "Buttons Not Clickable",
        "Scrollbar Issues",
        "Tooltip Errors",
    
        // Functional Errors
        "Broken Links",
        "Form Submission Failures",
        "JavaScript Errors",
        "Incorrect Form Validation",
        "Disabled Buttons Not Indicating State",
        "Redirect Loops",
        "Missing Features",
        "Search Functionality Not Working",
        "Incorrect Filters or Sorting",
        "Pagination Issues",
    
        // Performance Issues
        "Slow Loading Times",
        "High Resource Usage",
        "Unoptimized Images",
        "Too Many HTTP Requests",
        "Memory Leaks",
        "Inefficient Code",
        "Server Response Delays",
        "Third-party Script Issues",
    
        // Accessibility Issues
        "Missing Alt Text for Images",
        "Poor Color Contrast",
        "No Keyboard Navigation Support",
        "Screen Reader Incompatibility",
        "Missing ARIA Labels",
        "Inaccessible Forms",
        "Lack of Captions for Multimedia",
    
        // Security Issues
        "SQL Injection Vulnerabilities",
        "Cross-Site Scripting (XSS)",
        "Insecure Data Transmission",
        "Expired SSL Certificate",
        "Poor Password Policies",
        "Lack of User Input Validation",
        "Session Management Flaws",
    
        // Content Issues
        "Typos and Grammatical Errors",
        "Outdated Information",
        "Inconsistent Terminology",
        "Missing or Incorrect Metadata",
        "Duplicate Content",
        "Unclear Calls to Action",
    
        // Browser Compatibility Issues
        "Inconsistent Rendering Across Browsers",
        "JavaScript Not Supported in Some Browsers",
        "CSS Styles Not Applied Correctly",
    
        // Mobile Responsiveness Issues
        "Elements Not Scaling on Mobile",
        "Touch Targets Too Small",
        "Missing Mobile Features",
        "Orientation Issues",
    
        // API and Backend Issues
        "API Failures",
        "Data Retrieval Errors",
        "Server Errors (5xx)",
        "Client Errors (4xx)",
        "Database Connection Issues",
    
        // User Experience (UX) Issues
        "Confusing Navigation",
        "Inconsistent User Flows",
        "Lack of Feedback on Actions",
        "Poorly Designed Onboarding Process",
        "Frustrating Checkout Process",
    
        // Miscellaneous Issues
        "Unexpected Pop-ups or Ads",
        "Third-party Integration Failures",
        "Analytics Tracking Errors",
        "Broken Social Media Links",
        "Inaccessible Help or Support Links",
    
        // Error Types
        "Component Not Rendering",
        "TypeError",
        "ReferenceError",
        "SyntaxError",
        "Network Error",
        "API Error",
        "State Update Error",
        "Props Mismatch",
        "Unhandled Rejection",
        "Context Error",
        "Rendering Performance Issue",
        "Event Handler Error",
        "Dependency Error",
        "Hook Error",
        "Lifecycle Method Error",
        "Routing Error",
        "Async Error",
        "Component Key Error",
        "Invalid Prop Type",
        "Deprecated API Usage",
        "Runtime Error",
        "Compile Error",
        "Not a Function",
        "Invalid Component",
        "Memory Leak",
        "Unhandled Error",
        "Incorrect State Initialization",
        "Component Update Error",
        "Data Fetch Error",
        "DOM Manipulation Error",
        "Server-Side Rendering Error",
        "Error Boundaries Not Working",
        "Missing Dependency",
        "Invalid Context Value"
    ];
    

    const strengths = [
        // Foundational Skills
        "Basic Computer Literacy",
        "Basic Networking",
        "Attention to Detail",
        "Time Management",
    
        // Intermediate Skills
        "Technical Writing",
        "Research Skills",
        "Interpersonal Skills",
        "Self-Motivation",
        "Flexibility",
        "Effective Communication",
        "Teamwork",
    
        // Advanced Skills
        "Problem-Solving",
        "Analytical Thinking",
        "Creativity",
        "Collaboration",
        "Agile Methodologies",
        "Project Management",
    
        // Specialized Skills
        "Software Development",
        "Programming Languages",
        "Database Management",
        "Version Control",
        "Testing and Debugging",
    
        // Technical Proficiency
        "Data Analysis",
        "User Interface Design",
        "Cloud Computing",
        "Cybersecurity Awareness",
        "Mobile Development",
        "Web Development",
        "APIs Understanding",
    
        // Leadership and Innovation
        "Critical Thinking",
        "Innovation",
        "Design Thinking",
        "Business Acumen",
        "Ethical Hacking Awareness",
    
        // Professional Skills
        "Networking Knowledge",
        "Public Speaking",
        "Continuous Learning",
        "Negotiation Skills",
        "Portfolio Development",
    
        // Additional Skills
        "Customer Service Orientation",
        "Troubleshooting",
        "Version Control",
        "Software Development"
    ];
    


const areas_of_improvement = [
    // Weaknesses
    "Basic Terminology Confusion",
    "Incomplete Understanding of Core Concepts",
    "Theoretical vs. Practical Discrepancy",
    "Syntax Errors",
    "Debugging Difficulties",
    "Limited Language Proficiency",
    "Code Structure Issues",
    "Inefficient Algorithms",
    "Inability to Break Down Problems",
    "Relying Too Much on Libraries",
    "Procrastination",
    "Poor Test-Taking Strategies",
    "Overcommitting",
    "Ineffective Study Techniques",
    "Lack of Practice",
    "Ignoring Resources",
    "Poor Written Communication",
    "Weak Presentation Skills",
    "Collaboration Issues",
    "Anxiety During Tests",
    "Inconsistent Performance",
    "Failure to Review Mistakes",
    "Poor Planning Skills",
    "Lack of Resource Management",
    "Difficulty Adapting to Feedback",
    "Limited Research Skills",
    "Neglecting Documentation",
    "Not Staying Updated",
    "Lack of Networking Skills",
    "Insufficient Internship Experience",
    "Weak Resume and Interview Skills",
    "Difficulty with New Technologies",
    "Limited Database Knowledge",
    "Basic Networking Issues",
    "Fear of Failure",
    "Fixed Mindset",
    "Resistance to Change",
    "Emotional Intelligence Deficits",
    "Conflict Resolution Issues",
    "Time for Self-Reflection",

    // Areas for Improvement
    "Time Management",
    "Technical Depth",
    "Public Speaking",
    "Business Acumen",
    "Stress Management",
    "Networking Skills",
    "Self-Confidence",
    "Practical Experience",
    "Critical Analysis",
    "Presentation Skills",
    "Understanding of Business Processes",
    "Interpersonal Communication",
    "Effective Research",
    "New Technologies Adoption",
    "Soft Skills Development",
    "Analytical Skills",
    "Technical Documentation",
    "Professional Networking",
    "Feedback Reception",
    "Work-Life Balance",
    "Job Search Skills",
    "Interview Techniques",
    "Portfolio Development",
    "Industry Trends Awareness",
    "Negotiation Skills",
    "Leadership Skills",
    "Coding Practices",
    "Emotional Intelligence",
    "Cross-Functional Skills",
    "Collaboration Tools Proficiency",
    "Career Planning"
];



const mui_colors = ["#1976d2","#dc004e","#000","#ff9800","#2196f3","#f44336","#4caf50","#2196f3","#e33371","#ffb74d","#6ec6ff","#e57373","#81c784","#115293","grey","#9a0036","#f57c00","#0069c0","#d32f2f","#388e3c"];


export { allTechnologies, Cities, error_types, strengths, areas_of_improvement, mui_colors };