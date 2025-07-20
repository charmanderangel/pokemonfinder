# AWS Deployment Options for Your Static Website

Here are a few easy and popular options for deploying your static Pokémon website to AWS.

---

## Option 1: AWS Amplify (Easiest)

AWS Amplify is a service designed to make it extremely simple to deploy and host web applications. It's a great choice for beginners and for projects where you want to get up and running quickly.

### How it works:
You connect your Git repository (e.g., GitHub, GitLab, Bitbucket) to Amplify. Every time you push a change to your repository, Amplify will automatically build and deploy your site.

### Why it's easy:
- **Managed Hosting:** You don't have to configure servers.
- **CI/CD built-in:** Continuous integration and continuous deployment are set up automatically.
- **Global CDN:** Your website will be fast for users all around the world.
- **Custom Domains & SSL:** Easily set up your own domain with free HTTPS.

### High-Level Steps:
1.  Push your `pokemon-website` folder to a Git repository (like GitHub).
2.  Go to the AWS Amplify console.
3.  Connect your Git repository.
4.  Configure the build settings (for a simple static site, Amplify can often detect the settings automatically).
5.  Deploy!

---

## Option 2: Amazon S3 + Amazon CloudFront (Most Common & Cost-Effective)

This is a very common, robust, and cheap way to host a static website on AWS. It gives you a bit more control than Amplify.

### How it works:
- **Amazon S3 (Simple Storage Service):** You upload your website files (`index.html`, `style.css`, `script.js`, `images/`) to an S3 bucket.
- **Amazon CloudFront (Content Delivery Network):** You create a CloudFront "distribution" that points to your S3 bucket. This speeds up your website globally and provides HTTPS.

### Why it's a great option:
- **Low Cost:** S3 and CloudFront are very inexpensive for static sites with low-to-moderate traffic.
- **Scalability:** This setup can handle huge amounts of traffic.
- **Reliability:** S3 is designed for 99.999999999% durability.
- **Security:** CloudFront provides HTTPS and protection against some common attacks.

### High-Level Steps:
1.  Create an S3 bucket.
2.  Upload your project files to the bucket.
3.  Enable "static website hosting" on the S3 bucket.
4.  Create a CloudFront distribution and set the origin to your S3 bucket's website endpoint.
5.  Point your users to the CloudFront URL (or configure a custom domain).

---

## Recommendation

- If you want the **absolute fastest and simplest** way to get your site online, and you're using Git, go with **AWS Amplify**.
- If you want to learn a bit more about core AWS services and have a **highly scalable, low-cost** solution, go with **S3 + CloudFront**.

Before deploying, I recommend deleting the `pokemon-website/images/Pokémon Finder.html` file and the `pokemon-website/images/Pokémon Finder_files` directory as they don't seem to be part of your project.
