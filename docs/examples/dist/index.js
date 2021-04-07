(function () {
  'use strict';

  var examplesDefinitions = [
  	{
  		label: "Particles",
  		group: "particles",
  		children: [
  			{
  				label: "Particles 01",
  				id: "particles-01"
  			},
  			{
  				label: "Particles 02",
  				id: "particles-02"
  			}
  		]
  	},
  	{
  		label: "Geometry",
  		group: "geometry",
  		children: [
  			{
  				label: "Geometry",
  				id: "geometry"
  			},
  			{
  				label: "Instanced Geometry",
  				id: "instanced-geometry"
  			}
  		]
  	},
  	{
  		label: "Texture",
  		group: "texture",
  		children: [
  			{
  				label: "Texture",
  				id: "texture"
  			},
  			{
  				label: "Multi Face Texture",
  				id: "multi-texture"
  			},
  			{
  				label: "Enviornment Map"
  			},
  			{
  				label: "Projection Mapping",
  				id: "projection-mapping"
  			}
  		]
  	},
  	{
  		label: "Lighting",
  		group: "lighting",
  		children: [
  			{
  				label: "Directional Light",
  				id: "directional-light"
  			},
  			{
  				label: "Point Light",
  				id: "point-light"
  			},
  			{
  				label: "Spot Light",
  				id: "spot-light"
  			}
  		]
  	},
  	{
  		label: "Framebuffer",
  		group: "framebuffer",
  		children: [
  			{
  				label: "Shadow"
  			},
  			{
  				label: "Godrays",
  				id: "godrays"
  			},
  			{
  				label: "Persistence",
  				id: "persistence"
  			}
  		]
  	},
  	{
  		label: "Swap Renderer",
  		group: "swap-renderer",
  		children: [
  			{
  				label: "Particles",
  				id: "gpgpu-particles"
  			},
  			{
  				label: "Noise Texture",
  				id: "swaprenderer-noise-texture"
  			},
  			{
  				label: "Image",
  				id: "swaprenderer-image"
  			},
  			{
  				label: "Fluid",
  				id: "swaprenderer-fluid"
  			}
  		]
  	},
  	{
  		label: "Extra",
  		group: "extra",
  		children: [
  			{
  				label: "Mouse Picking",
  				id: "mouse-picking"
  			},
  			{
  				label: "Text",
  				id: "text"
  			},
  			{
  				label: "GLTF",
  				id: "gltf"
  			},
  			{
  				label: "Fog",
  				id: "fog"
  			}
  		]
  	}
  ];

  let currentExampleTitle = 'Particles 01';

  const viewerIframe = document.getElementById('preview-iframe');
  const appAside = document.getElementsByClassName('app-aside')[0];
  const appNav = document.getElementById('app-nav');
  const sourceLinkBtn = document.getElementById('source-link');
  const mobileNavToggleBtn = document.getElementById('toggle-mobile-nav');

  examplesDefinitions.forEach((groupDefinition) => {
    const { label, children } = groupDefinition;
    const groupHeadline = document.createElement('h3');
    groupHeadline.textContent = label;
    const childrenList = document.createElement('ul');

    appNav.appendChild(groupHeadline);
    appNav.appendChild(childrenList);

    children.forEach((definition) => {
      const link = document.createElement('a');
      if (definition.id) {
        link.setAttribute('href', `#${definition.id}`);
      }
      link.innerText = definition.label;

      const listItem = document.createElement('li');
      listItem.appendChild(link);
      childrenList.appendChild(listItem);
    });
  });

  function onHashChange() {
    if (location.hash) {
      const exampleName = location.hash.substring(1);

      document.title = `hwoa-rang-gl | ${exampleName}`;

      viewerIframe.setAttribute('src', `${exampleName}/index.html`);
      viewerIframe.setAttribute('title', currentExampleTitle);

      sourceLinkBtn.setAttribute(
        'href',
        `https://github.com/gnikoloff/hwoa-rang-gl/tree/main/docs/examples/${exampleName}/index.js`,
      );
    } else {
      const exampleName = 'particles-01';
      location.hash = exampleName;
      sourceLinkBtn.setAttribute(
        'href',
        `https://github.com/gnikoloff/hwoa-rang-gl/tree/main/docs/examples/${exampleName}/index.js`,
      );
    }
    if (appAside.classList.contains('visible')) {
      appAside.classList.remove('visible');
    }
  }

  function onNavClick(e) {
    if (e.target.nodeName === 'A') {
      currentExampleTitle = e.target.dataset.title;
    }
  }

  function toggleMobileNav() {
    appAside.classList.toggle('visible');
  }

  function onDOMLoad() {
    onHashChange();

    appNav.addEventListener('click', onNavClick);
    mobileNavToggleBtn.addEventListener('click', toggleMobileNav);
  }

  function onResize() {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
  }

  window.onhashchange = onHashChange;
  document.addEventListener('DOMContentLoaded', onDOMLoad);
  window.addEventListener('resize', onResize);
  onResize();

}());
