/*
	Hyperspace by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {

	var $window = $(window),
		$body = $('body'),
		$sidebar = $('#sidebar');

	// Breakpoints.
	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: [null, '480px']
	});

	// Hack: Enable IE flexbox workarounds.
	if (browser.name == 'ie')
		$body.addClass('is-ie');

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Forms.

	// Hack: Activate non-input submits.
	$('form').on('click', '.submit', function (event) {

		// Stop propagation, default.
		event.stopPropagation();
		event.preventDefault();

		// Submit form.
		$(this).parents('form').submit();

	});

	// Sidebar.
	if ($sidebar.length > 0) {

		var $sidebar_a = $sidebar.find('a');

		$sidebar_a
			.addClass('scrolly')
			.on('click', function () {

				var $this = $(this);

				// External link? Bail.
				if ($this.attr('href').charAt(0) != '#')
					return;

				// Deactivate all links.
				$sidebar_a.removeClass('active');

				// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
				$this
					.addClass('active')
					.addClass('active-locked');

			})
			.each(function () {

				var $this = $(this),
					id = $this.attr('href'),
					$section = $(id);

				// No section for this link? Bail.
				if ($section.length < 1)
					return;

				// Scrollex.
				$section.scrollex({
					mode: 'middle',
					top: '-20vh',
					bottom: '-20vh',
					initialize: function () {

						// Deactivate section.
						$section.addClass('inactive');

					},
					enter: function () {

						// Activate section.
						$section.removeClass('inactive');

						// No locked links? Deactivate all links and activate this section's one.
						if ($sidebar_a.filter('.active-locked').length == 0) {

							$sidebar_a.removeClass('active');
							$this.addClass('active');

						}

						// Otherwise, if this section's link is the one that's locked, unlock it.
						else if ($this.hasClass('active-locked'))
							$this.removeClass('active-locked');

					}
				});

			});

	}

	// Scrolly.
	$('.scrolly').scrolly({
		speed: 1000,
		offset: function () {

			// If <=large, >small, and sidebar is present, use its height as the offset.
			if (breakpoints.active('<=large')
				&& !breakpoints.active('<=small')
				&& $sidebar.length > 0)
				return $sidebar.height();

			return 0;

		}
	});

	// Spotlights.
	$('.spotlights > section')
		.scrollex({
			mode: 'middle',
			top: '-10vh',
			bottom: '-10vh',
			initialize: function () {

				// Deactivate section.
				$(this).addClass('inactive');

			},
			enter: function () {

				// Activate section.
				$(this).removeClass('inactive');

			}
		})
		.each(function () {

			var $this = $(this),
				$image = $this.find('.image'),
				$img = $image.find('img'),
				x;

			// Assign image.
			$image.css('background-image', 'url(' + $img.attr('src') + ')');

			// Set background position.
			if (x = $img.data('position'))
				$image.css('background-position', x);

			// Hide <img>.
			$img.hide();

		});

	// Features.
	$('.features')
		.scrollex({
			mode: 'middle',
			top: '-20vh',
			bottom: '-20vh',
			initialize: function () {

				// Deactivate section.
				$(this).addClass('inactive');

			},
			enter: function () {

				// Activate section.
				$(this).removeClass('inactive');

			}
		});

})(jQuery);

//Yes I'm very aware how nasty the below looks...I only have a few hours spare so don't judge. 
function toggleSidebar() {
	const sidebar = document.getElementById('sidebar');
	sidebar.classList.toggle('active'); // Add or remove the 'active' class
}


const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRyCQUq4WdQsgs8YuMlw6qD3_OTnbUw4EmkMnSMzyGEySLLdSZI9YHolVxpZE211enCxbfGEanEqsZc/pub?gid=312759886&single=true&output=csv';

async function fetchDataAndCreateCloud() {
	try {
		const response = await fetch(sheetUrl);
		const data = await response.text();

		// Parse CSV data (simple CSV parser)
		const rows = data.split('\n').slice(1); // Remove header row
		const names = rows
			.map(row => row.split(',')[2]) // Assuming the 'What should we call it?' column is the 3rd column (index 2)
			.filter(name => name && name.trim() !== ""); // Filter out empty values

		// Count frequencies of names
		const nameCounts = {};
		names.forEach(name => {
			nameCounts[name] = (nameCounts[name] || 0) + 1;
		});

		// Convert to an array of objects for the tag cloud
		const nameData = Object.keys(nameCounts).map(name => ({
			text: name,
			size: 12 + nameCounts[name] * 8 // Adjust size for more variation
		}));

		// Create the tag cloud
		createTagCloud(nameData);
	} catch (error) {
		console.error('Error fetching or processing data:', error);
	}
}

function createTagCloud(nameData) {
    // Enhanced color scale with more vivid colors
    const colorScale = d3.scaleOrdinal(d3.schemeSet3); // Better color palette than schemeCategory10

    // Create the tag cloud
    d3.layout.cloud()
        .size([500, 400]) // Width and height of cloud
        .words(nameData)
        .padding(5) // Smaller padding for better density
        .rotate(() => Math.random() > 0.5 ? 0 : 90) // Less chaotic rotations
        .font('Poppins') // Use a modern, clean font (can replace with 'Arial', 'Roboto', etc.)
        .fontWeight('600') // Medium weight for consistency
        .fontSize(d => d.size) // Dynamically set font size
        .on('end', words => draw(words, colorScale)) // Pass colorScale to draw function
        .start();
}

function draw(words, colorScale) {
    const container = d3.select('#tag-cloud');
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = container.node().getBoundingClientRect().height;

    // Clear previous SVG content to avoid overlapping clouds
    container.select('svg').remove();

    // Create an SVG with dynamic width and height
    const svg = container
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .append('g')
        .attr('transform', `translate(${containerWidth / 2}, ${containerHeight / 2})`);

    // Draw words with improved styles and animations
    svg.selectAll('text')
        .data(words)
        .enter().append('text')
        .style('font-size', d => d.size + 'px')
        .style('font-family', 'Poppins, Arial, sans-serif') // Fallback font
        .style('font-weight', '600')
        .style('fill', (d, i) => colorScale(i))
        .style('cursor', 'pointer')
        .style('text-shadow', '2px 2px 3px rgba(0, 0, 0, 0.3)') // Softer shadows
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x}, ${d.y})rotate(${d.rotate})`)
        .text(d => d.text)
        // Add hover effects with transitions
        .on('mouseover', function () {
            d3.select(this)
                .transition().duration(200) // Smooth animation
                .style('fill', '#FFD700') // Highlight color (gold)
                .style('font-size', d => d.size * 1.2 + 'px'); // Slight size increase
        })
        .on('mouseout', function (d, i) {
            d3.select(this)
                .transition().duration(200)
                .style('fill', colorScale(i))
                .style('font-size', d => d.size + 'px'); // Reset size
        });
}

// Fetch and create the tag cloud on load
fetchDataAndCreateCloud();

// Get modal and elements
var modal = document.getElementById("modal");
var openModalBtn = document.getElementById("openModal");
var closeModalBtn = document.getElementById("closeModal");

// Open modal on button click
openModalBtn.onclick = function () {
	modal.style.display = "block";
};

// Close modal on close button click
closeModalBtn.onclick = function () {
	modal.style.display = "none";
};

// Close modal if user clicks outside of the modal content
window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
};


function validateForm() {
	let isValid = true;

	// Get form field values
	const name = document.getElementById('name');
	const email = document.getElementById('email');
	const message = document.getElementById('message');

	// Get error message elements
	const nameError = document.getElementById('name-error');
	const emailError = document.getElementById('email-error');
	const messageError = document.getElementById('message-error');

	// Reset error messages
	nameError.style.display = 'none';
	emailError.style.display = 'none';
	messageError.style.display = 'none';

	// Validation logic
	if (!name.value.trim()) {
		nameError.style.display = 'block';
		isValid = false;
	}
	if (!email.value.trim() || !validateEmail(email.value)) {
		emailError.style.display = 'block';
		isValid = false;
	}
	if (!message.value.trim()) {
		messageError.style.display = 'block';
		isValid = false;
	}

	return isValid; // Prevent form submission if not valid
}

// Simple email validation function
function validateEmail(email) {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}



// Taxpayer Costs Calculation (Assuming a starting cost and increasing at a fixed rate)
const startCostMillion = 90; // Starting cost in millions
const costIncrementPerDay = 0.01; // Increment per day in millions
const startDate = new Date('2020-01-01'); // Project start date
const costElement = document.getElementById('taxpayer-cost');

function updateTaxpayerCost() {
	const today = new Date();
	const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
	const currentCost = (startCostMillion + daysElapsed * costIncrementPerDay).toFixed(2);
	costElement.textContent = `$${currentCost} Million (and counting)`;
}

// Time Overdue Calculation
const plannedStartDate = new Date('2021-01-01'); // Planned start date
const overdueElement = document.getElementById('time-overdue');

function updateTimeOverdue() {
	const today = new Date();
	const daysOverdue = Math.max(0, Math.floor((today - plannedStartDate) / (1000 * 60 * 60 * 24)));
	overdueElement.textContent = `${daysOverdue} Days`;
}


// Initial update
updateTaxpayerCost();
updateTimeOverdue();


// Utility function to calculate new values based on elapsed time 
function calculateCurrentCost() {
	const startCostMillion = 90;
	const costIncrementPerDay = 0.01;
	const startDate = new Date('2020-01-01');
	const today = new Date();
	const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
	return (startCostMillion + daysElapsed * costIncrementPerDay).toFixed(2);
}

function calculateProjectedStorageCosts() {
	const baseCosts = [1.2, 5, 10, 15, 20, 24.3];
	const today = new Date();
	const multiplier = Math.sin(today.getTime() / (1000 * 60 * 60 * 24)) * 0.5 + 1; 
	return baseCosts.map(value => (value * multiplier).toFixed(2));
}

function calculateEconomicLosses() {
	const baseLosses = [350, 400, 550, 650, 800];
	const today = new Date();
	const incrementFactor = (today.getFullYear() - 2020) * 50; 
	return baseLosses.map((value, index) => value + index * incrementFactor);
}

// Chart configurations with initial data
var optionsCostOverruns = {
	chart: { type: 'bar', height: 300, background: 'transparent' },
	series: [{ name: 'Cost (in millions)', data: [90, 375] }],
	xaxis: { categories: ['Original Budget ($M)', 'Current Cost ($M)'], labels: { style: { colors: ['#ffffff'], fontSize: '12px' } } },
	colors: ['#FF6F61', '#6A1B9A'],
	title: { text: '', align: 'center', style: { color: '#ffffff' } },
	tooltip: { theme: 'dark' },
	yaxis: { labels: { style: { colors: ['#ffffff'], fontSize: '12px' } } }
};
var chartCostOverruns = new ApexCharts(document.querySelector("#graph-cost-overruns"), optionsCostOverruns);
chartCostOverruns.render();

var optionsDelays = {
	chart: { type: 'bar', height: 300, background: 'transparent' },
	series: [{ name: 'Year', data: [2021, 2027] }],
	xaxis: { categories: ['Planned Start Year', 'Actual Start Year'], labels: { style: { colors: ['#ffffff'], fontSize: '12px' } } },
	yaxis: { min: 2015, max: 2030, labels: { style: { colors: ['#ffffff'], fontSize: '12px' } } },
	colors: ['#29B6F6', '#AB47BC'],
	title: { text: '', align: 'center', style: { color: '#ffffff' } },
	tooltip: { theme: 'dark' }
};
var chartDelays = new ApexCharts(document.querySelector("#graph-delays"), optionsDelays);
chartDelays.render();

var optionsStorageCosts = {
	chart: { type: 'line', height: 300, background: 'transparent' },
	series: [{ name: 'Storage Costs (in $M)', data: [1.2, 5, 10, 15, 20, 24.3] }],
	xaxis: { categories: ['Jan 2021', 'Jul 2021', 'Jan 2022', 'Jul 2022', 'Jan 2023', 'Mid-2026'], labels: { style: { colors: ['#ffffff'], fontSize: '12px' } } },
	colors: ['#FF7043'],
	title: { text: '', align: 'center', style: { color: '#ffffff' } },
	tooltip: { theme: 'dark' },
	yaxis: { labels: { style: { colors: ['#ffffff'], fontSize: '12px' } } }
};
var chartStorageCosts = new ApexCharts(document.querySelector("#graph-storage-costs"), optionsStorageCosts);
chartStorageCosts.render();

var optionsEconomicImpact = {
	chart: { type: 'line', height: 300, background: 'transparent' },
	series: [{ name: 'Economic Losses (in $M)', data: [350, 400, 550, 650, 800] }],
	xaxis: { categories: ['2020', '2021', '2022', '2023', '2024'], labels: { style: { colors: ['#ffffff'], fontSize: '12px' } } },
	colors: ['#D32F2F'],
	title: { text: '', align: 'center', style: { color: '#ffffff' } },
	tooltip: { theme: 'dark' },
	yaxis: { labels: { style: { colors: ['#ffffff'], fontSize: '12px' } } }
};
var chartEconomicImpact = new ApexCharts(document.querySelector("#graph-economic-impact"), optionsEconomicImpact);
chartEconomicImpact.render();

// Function to update the charts with new data dynamically
function updateCharts() {
	const newCost = calculateCurrentCost();
	chartCostOverruns.updateSeries([{ name: 'Cost (in millions)', data: [90, parseFloat(newCost)] }]);
	const newStorageCosts = calculateProjectedStorageCosts();
	chartStorageCosts.updateSeries([{ name: 'Storage Costs (in $M)', data: newStorageCosts }]);
	const newEconomicLosses = calculateEconomicLosses();
	chartEconomicImpact.updateSeries([{ name: 'Economic Losses (in $M)', data: newEconomicLosses }]);
}

updateCharts()




var currentFeed = 'Spirit IV';
var iframeContainer = document.getElementById('iframe-container');
var button = document.getElementById('toggle-button');
var iframeLoaded = false; 

function createIframe(src, id) {
	var iframe = document.createElement('iframe');
	iframe.src = src;
	iframe.id = id;
	iframe.frameBorder = '0';
	iframe.allowFullscreen = true;
	iframe.loading = 'lazy'; 
	iframe.style.width = '102%';
	iframe.style.height = '100%';
	iframe.style.flex = '1';
	return iframe;
}


function loadInitialIframe() {
	if (!document.getElementById('live-feed-4')) {
		iframeContainer.innerHTML = ''; 
		var initialIframe = createIframe('https://enlapser.cloud/203270019/en', 'live-feed-4');
		iframeContainer.appendChild(initialIframe);
		iframeLoaded = true; 

	}
}

function toggleIframe() {
	if (!iframeLoaded) {
		loadInitialIframe();
	}
	var currentIframe = document.getElementById('live-feed-4') || document.getElementById('live-feed-5');
	if (currentFeed === 'Spirit IV') {
		// Switch to Spirit V
		currentIframe.src = 'https://enlapser.cloud/1777667329/en/';
		currentIframe.id = 'live-feed-5';
		currentFeed = 'Spirit V';
		button.textContent = 'Switch to Spirit IV';
	} else {
		// Switch to Spirit IV
		currentIframe.src = 'https://enlapser.cloud/203270019/en';
		currentIframe.id = 'live-feed-4';
		currentFeed = 'Spirit IV';
		button.textContent = 'Switch to Spirit V';
	}
}

// Load the initial iframe when button is clicked for the first time
button.addEventListener('click', function () {
	loadInitialIframe();
	toggleIframe();
});

window.onload = function () {
	loadInitialIframe();
};