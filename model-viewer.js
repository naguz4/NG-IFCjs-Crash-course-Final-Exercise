import { IfcViewerAPI } from "web-ifc-viewer";
import { projects } from "./projects.js";
import { Color } from "three";
import {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCDOOR,
  IFCWINDOW,
  IFCFURNISHINGELEMENT,
  IFCMEMBER,
  IFCPLATE
} from 'web-ifc';


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

async function loadIfcUrl(url) {
	await viewer.IFC.setWasmPath("../../../");
	const model = await viewer.IFC.loadIfcUrl(url);
	model.removeFromParent();
	await viewer.shadowDropper.renderShadow(model.modelID);

	await setupAllCategories();
}

loadIfcUrl(currentProject.url);

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

//Select Items
window.ondblclick = async () => await viewer.IFC.selector.pickIfcItem();
window.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();


const scene = viewer.context.getScene();

// List of categories names
const categories = {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCFURNISHINGELEMENT,
  IFCDOOR,
  IFCWINDOW,
  IFCPLATE,
  IFCMEMBER
};

// Gets the name of a category
function getName(category) {
  const names = Object.keys(categories);
  return names.find(name => categories[name] === category);
}

// Gets the IDs of all the items of a specific category
async function getAll(category) {
  return viewer.IFC.loader.ifcManager.getAllItemsOfType(0, category, false);
}

// Creates a new subset containing all elements of a category
async function newSubsetOfType(category) {
  const ids = await getAll(category);
  return viewer.IFC.loader.ifcManager.createSubset({
      modelID: 0,
      scene,
      ids,
      removePrevious: true,
      customID: category.toString()
  })
}

// Stores the created subsets
const subsets = {};

async function setupAllCategories() {
	const allCategories = Object.values(categories);
	for (let i = 0; i < allCategories.length; i++) {
		const category = allCategories[i];
		await setupCategory(category);
	}
}

// Creates a new subset and configures the checkbox
async function setupCategory(category) {
	subsets[category] = await newSubsetOfType(category);
	setupCheckBox(category);
}

// Sets up the checkbox event to hide / show elements
function setupCheckBox(category) {
	const name = getName(category);
	const checkBox = document.getElementById(name);
	checkBox.addEventListener('change', (event) => {
		const checked = event.target.checked;
		const subset = subsets[category];
		if (checked) scene.add(subset);
		else subset.removeFromParent();
	});
}