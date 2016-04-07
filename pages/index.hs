<!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8"/>
<title>AutoSVG</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,300italic,400,400italic,600,600italic%7CNoto+Serif:400,400italic,700,700italic%7CDroid+Sans+Mono:400,700">
<link rel="stylesheet" href="app/vendor.css"/>
<link rel="stylesheet" href="style.css"/>
</head>
<body>
<div class="container">
<ul>
  <a href="app/index.html">AutoSVG</a>
  {{#each documents}}
    <li><a href="{{ link }}">{{ title }}</a></li> 
  {{/each}}
</ul>
</div>
</body>
<script>
</script>

</html>
