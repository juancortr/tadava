import React, { Component } from 'react';
import PropTypes from "prop-types";
import NodeNavigator from "./NodeNavigator.js";
import { Button } from 'antd';
let FileSaver = require('file-saver');

const ButtonGroup = Button.Group;
const cat = "categorical";
const seq = "sequential";
let d3 = require("d3");
let d3_chromatic = require("d3-scale-chromatic");
class Visualization extends Component {

 componentWillUpdate(newProps) {
    if(newProps.exportData.length === this.props.exportData.length){
      if(newProps.attChange !== this.props.attChange){
        this.deleteWidget();
        this.props.onChangeAtt(false);
        this.setUpNodeNavigator();
      }
      else {
        this.setUpNodeNavigator();
      }
    }

  }
  deleteWidget = () => {
    var myNode = document.getElementById("vis");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
  }
  setUpNodeNavigator = () => {
    this.nn = new NodeNavigator(this.target, 600)
      // the next line is commented because the node navigator creates a sequential id 
      // .id(this.props.id)
      .updateCallback(this.props.updateCallback);
      this.props.attributes.forEach((d,i)=>{
        if(d.checked){
        console.log(this.props.data)
        console.log("------------");

          if(d.type === cat){
            console.log('cat',d.name);
            this.nn.addCategoricalAttrib(d.name);
          }else if(d.type === seq){
            console.log('seq',d.name);
            if(d.data=== "date"){
              console.log('date')
              this.nn.addSequentialAttrib(d.name,
                        d3.scalePow()
                          .exponent(0.25)
                          .range([d3_chromatic.interpolatePurples(0), d3_chromatic.interpolatePurples(1)]))
            }
            else {
              this.nn.addSequentialAttrib(d.name);
            }
            
          }

         console.log("------------");
       }
      })

    if (this.props.data) {
      this.nn.data(this.props.data);
    }
  }
	componentDidMount() {
    this.props.setLoading(true);
    this.setUpNodeNavigator();
    
  }
  onClick = () => {
    this.props.setLoaded();
  }
  exportVisualization = () => {
    let nn = d3.select("#nodeNavigator");
    let nnhtml = document.getElementById("nodeNavigator");
    let mimeType = 'text/html';
    let catColumns = [];
    let seqColumns = [];
    this.props.attributes.forEach((a)=>{
      if(a.type === "categorical"){
        catColumns.push(a.name);
      }else {
        seqColumns.push(a.name);
      }
    })
    console.log(this.props.attributes);
    let elHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Navio</title>
</head>
<body>
  <div id="Navio"></div>

  <script src="https://d3js.org/d3.v4.min.js"></script>
  <script src="https://d3js.org/d3-interpolate.v1.min.js"></script>
  <script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
  <script type="text/javascript" src="https://john-guerra.github.io/Navio/Navio.js"></script>
  <script type="text/javascript">
    let nn = new Navio("#Navio", 600);
    let cat = "categorical"
    let seq = "sequential";
  let attributes = JSON.parse('${JSON.stringify(this.props.attributes)}');
    d3.csv("./export_data.csv", function (err, data) {
      if (err) throw err;
    data.forEach((row) => {
      attributes.forEach(att=> {
        if(att.data === "date"){
          let mydate = new Date(row[att.name]);
          if(isNaN(mydate.getDate())){
            row[att.name] = null;
          }else {
            row[att.name] = mydate
          }
          
        }
        else if(att.data=== "number"){
          let mynumber = +row[att.name];
          if(isNaN(mynumber)){
            row[att.name] = null;
          }else{
            row[att.name] = mynumber;
          }
        }
      })
    })

    attributes.forEach((d,i)=>{
        if(d.checked){
        console.log("------------");

          if(d.type === cat){
            console.log('cat',d.name);
            nn.addCategoricalAttrib(d.name);
          }else if(d.type === seq){
            console.log('seq',d.name);
            if(d.data=== "date"){
              console.log('date')
              nn.addSequentialAttrib(d.name,
                        d3.scalePow()
                          .exponent(0.25)
                          .range([d3.interpolatePurples(0), d3.interpolatePurples(1)]))
            }
            else {
              nn.addSequentialAttrib(d.name);
            }
            
          }

         console.log("------------");
       }
      })

    nn.data(data);
  });
  </script>
</body>
</html>`;
console.log(elHtml);


    let link = document.getElementById('downloadLink');
    mimeType = mimeType || 'text/plain';
    let filename = 'index.html'
    link.setAttribute('download', filename);
    link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elHtml));
    // link.click(); 
    if (this.props.exportData.length === 0) {
      this.download();
    }else {
      this.download();  
    }
  }

  download = (full) => {
    // let data = this.props.data;
    let data = this.props.exportData.length === 0? this.props.data : this.props.exportData;
    // data.forEach(d=>delete d.__i);
    const items = data.slice();
    // items.forEach(d=>delete d.__i);
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    console.log('after csv')
    csv.unshift(header.join(','))
    csv = csv.join('\r\n')
    var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
    FileSaver.saveAs(blob, "export_data.csv");
  }
	render() {
    const filter = this.props.exportData.length === 0;
		return (
          <div className="visualization">
            <div className="change-dataset-button">
              <ButtonGroup>
                <Button onClick={this.onClick}>Change dataset</Button>
                <Button onClick={this.download}><a href="#" id="export">Export Data</a></Button>
                <Button onClick={this.exportVisualization}><a  href="#" id="downloadLink">Export Visualization</a></Button>
              </ButtonGroup>
            </div>
      		  <div id="vis" ref={(target) => this.target = target }>
  	        </div>
          </div>
		)
	}
}
Visualization.propTypes = {
  data: PropTypes.array.isRequired,
  updateCallback: PropTypes.func.isRequired
};
export default Visualization;