import { IfcViewerAPI } from "web-ifc-viewer";
import { projects } from "./projects.js";
import { Color } from "three";


const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({container, backgroundColor: new Color(255, 255, 255)});

viewer.axes.setAxes();
viewer.grid.setGrid();

// Get the current project ID from the URL parameter

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const currentProjectID = url.searchParams.get("id");

//Get the current Project
const currentProject = projects.find(project => project.id === currentProjectID);

//Add the project URL to the iframe
viewer.IFC.setWasmPath('../../../');
viewer.IFC.loadIfcUrl(currentProject.url);

// Set up Clipper Button
const clipperButton = document.getElementById('clipper-button');

let clippingPlanesActive = false;
clipperButton.onclick = () => {
  clippingPlanesActive = !clippingPlanesActive;
  viewer.clipper.active = clippingPlanesActive;

  if(clippingPlanesActive) {
    clipperButton.classList.add('active');
  } else {
    clipperButton.classList.remove('active');
  }
}

window.ondblclick = () => {
  if(clippingPlanesActive) {
    viewer.clipper.createPlane();
  }
}

window.onkeydown = (event) => {
  if(event.code === 'Delete' && clippingPlanesActive) {
    viewer.clipper.deletePlane();
  }
}

window.ondblclick = async () => await viewer.IFC.selector.pickIfcItem();
window.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();