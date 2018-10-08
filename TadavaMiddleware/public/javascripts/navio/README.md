# Navio

**Navio** is a d3 visualization widget to help summarizing, exploring and navigating large datasets. It supports three main interactions, click on a header to sort the data, click on a value to select it, or drag to select a range. 
![Navio Demo with the MoMa Collection](Navio_MomaExplorer.gif)

## Use it with Shipyard:

If you have data and just want a quick way of summarize it, explore it or filter it, you can try Shipyard, our stand-alone application for Navio. (You can also export template code to use it)

[Try Shipyard](https://john-guerra.github.io/Navio/shipyard/build/index.html)
![Shipyard demo](shipyard/demo.png)

### Demos:

* [MoMa Collection](https://john-guerra.github.io/momaExplorer/) ([Code](https://github.com/john-guerra/momaExplorer))
* [Navio-only Vast 2017 MiniChallenge1 ](http://john-guerra.github.io/Navio/example_vastChallenge2017/index.html) ([Code](https://github.com/john-guerra/Navio/tree/master/example_vastChallenge2017))
* [Co-voting patterns of the Colombian senate](http://johnguerra.co/viz/senadoColombia) 
* [Simplest example with Networks on SVG](https://john-guerra.github.io/Navio/example/) ([Code](https://github.com/john-guerra/Navio/tree/master/example))
* [Simple example with Networks on Canvas](https://john-guerra.github.io/Navio/exampleSenate/) ([Code](https://github.com/john-guerra/Navio/tree/master/exampleSenate))

# Usage

TLDR
```html
<!DOCTYPE html>
<body>
  <!-- Placeholder for the widget -->
  <div id="navio"></div>


  <!-- NAVIO Step 0: Load the libraries -->
  <script src="https://d3js.org/d3.v4.min.js"></script>
  <script type="text/javascript" src="https://john-guerra.github.io/Navio/Navio.js"></script>
<script>

<script>
  // NAVIO  Step 1.  Create a Navio passing the selector to place it and the height
  var nn = new Navio("#navio", 600);

  // NAVIO Step 2. Add the Categorical and Sequential attributes you want to use
  var catColumns = [ YOUR_CATEGORICAL_ATTRIBUTE_NAMES_HERE ];
  var seqColumns = [ YOUR_SEQUENTIAL_ATTRIBUTE_NAMES_HERE ];
  catColumns.forEach((c) => nn.addCategoricalAttrib(c));
  seqColumns.forEach((c) => nn.addSequentialAttrib(c));

  // NAVIO Step 3. Load your data!
  d3.csv(YOUR_DATA, function (err, data) {
    if (err) throw err;

    nn.data(data);
  });
</script>
</body>
</html>
```
### Step by step
1. Start with this template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Basic Usage</title>
</head>
<body>

  // Your Navio widget goes here
  <div id="Navio"></div>

</body>
</html>

```
2. Create and import a new JavaScript file below the scripts (d3 and Navio) or right in the html like in the example below.
```html
<script src="https://d3js.org/d3.v4.min.js"></script>
<script type="text/javascript" src="https://john-guerra.github.io/Navio/Navio.js"></script>
<script type="text/javascript">
  //   YOUR_JS_CODE_HERE
</script>
```
3. Create an array with the columns that are categorical and another for the sequential.

```javascript
var catColumns = [
  "car-type",
  "gate-name",
  "dayOfTheWeek"
];
var seqColumns = [
  "minutes",
  "hours",
  "day",
  "month"
];
```
4. Set the Navio and its attributes
``` javascript
var nn = new Navio("#Navio", 600);
catColumns.forEach((c) => nn.addCategoricalAttrib(c));
seqColumns.forEach((c) => nn.addSequentialAttrib(c));

// You can also pass custom Attributes
var color = d3.scaleOrdinal(d3.schemeSet3)
nn.addAttrib("cluster", color);

```
5. Read CSV dataset and set the data
``` javascript
d3.csv("./dataset.csv", function (err, data) {
  if (err) throw err;
  nn.data(data);
});

```

## License

Navio.js is licensed under the MIT license. (http://opensource.org/licenses/MIT)
