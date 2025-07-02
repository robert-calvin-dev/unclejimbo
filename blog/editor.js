if (sessionStorage.getItem('kimLoggedIn') !== 'true') {
  window.location.href = '/login/index.html';
}

document.getElementById('postForm').addEventListener('submit', function (e) {
  e.preventDefault();
  generateAndDownloadPost();
});

document.getElementById('previewBtn').addEventListener('click', function () {
  const html = buildHTML();
  const preview = document.getElementById('previewArea');
  preview.innerHTML = `<iframe width="100%" height="500" sandbox="allow-same-origin" srcdoc='${html.replace(/'/g, "&apos;")}'></iframe>`;
  preview.style.display = 'block';
});

document.getElementById('publishBtn').addEventListener('click', function () {
  generatePostZip().then(({ blob, filename }) => {
    const title = document.getElementById('postTitle').value.trim();
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('slug', safeTitle); // ✅ SEND SLUG TO MAKE.COM

    fetch('https://hook.us2.make.com/vvtc6u4ck75qc1xr8ii9541948c5pw00', {
      method: 'POST',
      body: formData
    }).then(res => {
      alert('Post sent for publishing!');
    }).catch(err => {
      console.error(err);
      alert('Failed to send post to Make.com');
    });
  });
});



function buildHTML() {
  const title = document.getElementById('postTitle').value.trim();
  const tags = document.getElementById('postTags').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const imgInput = document.getElementById('postImage');

  let imageTag = '';
  if (imgInput.files[0]) {
    const filename = imgInput.files[0].name;
    imageTag = `<img src="/assets/images/${filename}" alt="${title}" style="max-width:100%; border-radius:8px; margin-bottom:20px;" />`;
  }

  return `
    <div id="header">Header content here</div>
    <article>
      <h1>${title}</h1>
      ${imageTag}
      <div>${content.replace(/\n/g, '<br>')}</div>
      <p><em>Tags: ${tags}</em></p>
    </article>
    <div id="footer">Footer content here</div>
    <script src="/assets/js/script.js"></script>
    <link rel="stylesheet" href="/assets/css/style.css">
  `;
}

function generateAndDownloadPost() {
  const htmlContent = buildHTML();
  const title = document.getElementById('postTitle').value.trim();
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filename = `${safeTitle}/index.html`;

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <main>${htmlContent}</main>
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: 'text/html' });
  const zip = new JSZip();
  const imageFile = document.getElementById('postImage').files[0];

  if (imageFile) {
    zip.file(`assets/images/${imageFile.name}`, imageFile);
  }

  zip.folder(safeTitle).file("index.html", fullHTML);
  zip.generateAsync({ type: "blob" }).then(function(content) {
    saveAs(content, `${safeTitle}.zip`);
  });
}

function generatePostZip() {
  const htmlContent = buildHTML();
  const title = document.getElementById('postTitle').value.trim();
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const imageFile = document.getElementById('postImage').files[0];

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <div id="header"></div>
  <main>${htmlContent}</main>
  <div id="footer"></div>
  <script src="/assets/js/script.js"></script>
</body>
</html>`;

  const zip = new JSZip();
  zip.folder(safeTitle).file("index.html", fullHTML);

  if (imageFile) {
    zip.folder("assets/images").file(imageFile.name, imageFile);
  }

  return zip.generateAsync({ type: "blob" }).then(function(blob) {
    return { blob, filename: `${safeTitle}.zip` };
  });
}

