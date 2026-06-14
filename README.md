# SenangStart XR

A graphical User Interface framework for [A-Frame](https://aframe.io).


![](examples/images/overview.png)

The `senangstart-xr` components provide layout and gui widgets that can be used
to create a user interface in an A-Frame scene. 

The `dist/senangstart-xr.js` file defines the following components:

| Component             | Primitive                | Description |
| --------------------  | ------------------------ | -------------------------------------------------------  |
| sxr-flex-container    | a-sxr-flex-container     | Layout container with flexbox-inspired                   |
| sxr-item              | <none>                   | Used by other components for common properties like height and width    |
| sxr-interactable      | <none>                   | Used by other components to define onclick behavior      |
| sxr-cursor            | a-sxr-cursor             | Cursor used to interact with GUI elements.               |
| sxr-button            | a-sxr-button             | Standard button component with text label                |
| sxr-icon-button       | a-sxr-icon-button        | Button with icon label instead of text                   |
| sxr-icon-label-button | a-sxr-icon-label-button  | Button with both icon and text labels                    |
| sxr-radio             | a-sxr-radio              | Radio button                                             |
| sxr-toggle            | a-sxr-toggle             | Toggle button                                            |
| sxr-slider            | a-sxr-slider             | Slider component                                         |
| sxr-vertical-slider   | a-sxr-slider             | Vertical slider component                                |
| sxr-input             | a-sxr-input              | Text input field                                         |
| sxr-label             | a-sxr-label              | Text label                                               |
| sxr-progress-bar      | a-sxr-progress-bar       | Progress bar                                             |
| sxr-circle-loader     | a-sxr-circle-loader      | Circular progress meter                                  |
| sxr-circle-timer      | a-sxr-circle-timer       | Circular progress meter with timer                       |


## Brand colors

| Token | Value | Legacy alias |
| ----- | ----- | ------------ |
| primary | `#2563EB` | key_orange |
| primaryGradient | `linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)` | |
| secondary | `#0EA5E9` | key_orange_light |
| darkBase | `#1B1B1F` | |
| darkDeeper | `#161618` | |
| darkCard | `#202127` | |
| accent | `#2563EB` | |
| slate100 | `#F1F5F9` | |
| success | `#10B981` | |
| warning | `#F59E0B` | |
| background | `#161618` | key_grey_dark |
| surface | `#202127` | key_grey |
| onSurface | `#F1F5F9` | key_offwhite, key_white |
| border | `#1B1B1F` | |
| error | `#EF4444` | |
| neutral | `#1B1B1F` | key_grey_light |

The default text font is Outfit, loaded from `Outfit-Regular.woff2`; `Outfit-Regular.ttf` is included as a fallback/source asset.




## Examples

A ready-to-run demo scene is included at [`examples/index.html`](examples/index.html).
Open it in a browser (serve the folder over HTTP, e.g. `npx serve .`) to see the
widgets in action.

## Use in your A-Frame project

Include A-Frame, then the SenangStart XR bundle, in the `<head>` of your page:

```html
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
<!-- local build -->
<script src="dist/senangstart-xr.js"></script>
```

Then use the `a-sxr-*` primitives inside your `<a-scene>` (see the Components
section below and `examples/index.html`).


## Building

Run the following to build to the examples/js folder:

`npm run dist-example`

`npm run dist-example-min`


## Run locally

Run the following start the webpack-dev-server:

`npm start`

The webpack-dev-server should now be running at http://localhost:8080


## Components

### a-sxr-flex-container Component
#### Properties

| Property         | Description                                            | Default Value |
| --------         | ----------------------------------------------------   | ------------- |
| flex-direction   | property specifies how flex items are placed in the flex container defining the main axis and the direction: 'row', 'column'                                       | 'row'         |
| justify-content  | property defines distributed space between and around content items along the main axis of their container: 'flexStart','center','flexEnd'                         | 'flexStart'   |
| align-items      | property defines distributed space between and around flex items along the cross-axis of their container. Like justify-content but in the perpendicular direction. | 'flexStart'   |
| item-padding     | Padding between items                                                                                                                                              | 0.0           |
| opacity          | Transparency of the flex-conntainer                                                                                                                                | 0.0           |
| is-top-container | Setting background of the flex-container                                                                                                                           | false         |
| panel-color      | Background color of the flex-container                                                                                                                             | #202127       |
| panel-rounded    | flex-container panel rounding radius                                                                                                                               | 0.05          |

```html
<a-sxr-flex-container 
    flex-direction="column" justify-content="center" align-items="normal" component-padding="0.1" opacity="0.7" width="3.5" height="4.5" 
    panel-color="#072B73" 
    panel-rounded="0.2"
	position="0 2.5 -6" rotation="0 0 0"
>
... gui items here...

</a-sxr-flex-container>
```

### a-sxr-cursor Component
#### Properties

| Property    | Description                                               | Default Value |
| --------    | -------------------------------------------------------   | ------------- |
| color       | Cursor initial color                                      | #F1F5F9       |
| hover-color | Cursor hover color                                        | #F1F5F9       |
| active-color| Cursor selection/active color                             | #2563EB       |
| distance    | distance of the pointer from the camera                   | -1            |
| design      | choose a design: 'dot', 'ring', 'cross' or 'reticle'      | 'dot'         |

```html
		<!-- Camera + cursor. -->
		<a-entity id="cameraRig" position="0 1.6 0">
			<a-camera look-controls wasd-controls position="0 0 0">
				<a-sxr-cursor id="cursor"
						  raycaster="objects: [sxr-interactable]"
						  fuse="true" fuse-timeout="2000"
						  color="#ECEFF1"
						  hover-color="#CFD8DC"
						  active-color="#607D8B"
						  design="ring" > <!-- dot, ring, reticle, cross  -->
				</a-sxr-cursor> <!-- /cursor -->
			</a-camera> <!-- /camera -->
		</a-entity>		
```

#### Example without fuse/gaze trigger (click trigger):

```html
		<!-- Camera + cursor. -->
		<a-entity id="cameraRig" position="0 1.6 0">
			<a-camera look-controls wasd-controls position="0 0 0">
				<a-sxr-cursor id="cursor"
						  raycaster="objects: [sxr-interactable]"
						  fuse="false"
				>
				</a-sxr-cursor> <!-- /cursor -->
			</a-camera> <!-- /camera -->
		</a-entity>
```


### a-sxr-button Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| on                 | Event that triggers onclick action                        | click         |
| value              | Text of button label                                      |               |
| font-size          | Font size for button                                      | 0.2           |
| font-family        | Font family for button                                    | ''            |
| font-color         | Text color for button label                               | #F1F5F9       |
| border-color       | Border color of button                                    | #F1F5F9       |
| focus-color        | Focus color of button                                     | #0EA5E9       |
| background-color   | Background color of button                                | #202127       |
| hover-color        | Background color when button is in hover state            | #161618       |
| active-color       | Background color when button is pressed down              | #2563EB       |
| toggle             | If true, button acts as toggle button with on/off state   | false         |
| toggle-state       | Setting the toggle button on/off state                    | false         |

| width              | Width of button                                           | 1             |
| height             | Height of button                                          | 1             |
| depth              | Depth of button                                           | 0.02          |
| base-depth         | Depth of the base of the button                           | 0.01          |
| gap                | Gap between button and base                               | 0.025         |
| margin             | Margin around button                                      | 0 0 0 0       |

| bevel              | If true, button bevel is enabled                          | false         |
| bevel-segments     | Segments of the button bevel                              | 5             |
| steps              | Steps of the button bevel                                 | 2             |
| bevel-size         | Size of the button bevel                                  | 0.1           |
| bevel-offset       | Offset of the button bevel                                | 0             |
| bevel-thickness    | Thickness of the button bevel                             | 0.1           |

```html
	<a-sxr-button
		width="2.5" 
		height="0.7" 
		base-depth="0.025" 
		depth="0.1"
		gap="0.1"

		onclick="buttonActionFunction" key-code="32"
		value="Sample Button"
		font-family="Outfit-Regular.woff2"
		font-size="0.25"
		margin="0 0 0.05 0"

		font-color="black"
		active-color="red"
		hover-color="yellow"
		border-color="white"
		focus-color="black"
		background-color="orange"

		bevel="true"
	>
	</a-sxr-button>
```

### a-sxr-circle-loader Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| active-color       | Color of ring that indicates loading progress             | #2563EB       |
| background-color   | Background color of item                                  | #202127       |
| loaded             | Initial percentage progress value                         | 0.5           |
| font-color         | Text color for progress percentage text                   | #F1F5F9       |
| font-family        | Font family for progress percentage text                  | ''            |
| font-size          | Font size for progress percentage text                    | 0.2           |
| height             | Height of item                                            | 1             |
| width              | Width of item                                             | 1             |
| margin             | Margin around item                                        | 0 0 0 0       |

```html
	<a-sxr-circle-loader
		height="0.75"
		font-family="Outfit-Regular.woff2"
		font-size="0.2"
		loaded="0.3456"		
		margin="0 0 0.1 0"
		background-color="#999"
	>
	</a-sxr-circle-loader>	
```

### a-sxr-circle-timer Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| font-size          | Font size for countdown text                              | 0.2           |
| font-family        | Font family for progress countdown text                   | ''            |
| font-color         | Text color for progress countdown text                    | #F1F5F9       |
| border-color       | Color of indicators that show 25/50/75/100 progress       | #202127       |
| background-color   | Background color of item                                  | #202127       |
| active-color       | Color of ring that indicates countdown progress           | #2563EB       |

| count-down         | Initial countdown value in seconds                        | 0             |
| callback           | callback function that fires when countdown expires       | ''            |

| width              | Width of item                                             | 1             |
| height             | Height of item                                            | 1             |
| margin             | Margin around item                                        | 0 0 0 0       |

```html
<a-sxr-circle-timer
	height="0.75"
	count-down="60"
	callback="timedout"
	font-family="Outfit-Regular.woff2"
	margin="0 0 0.1 0"
>
</a-sxr-circle-timer>
```

### a-sxr-icon-button Component
#### Properties

| Property           | Description                                               | Default Value |
| --------           | -------------------------------------------------------   | ------------- |
| on                 | Event that triggers onclick action                        | click         |

| icon               | SenangStart icon slug, e.g. `check`, `play`, `cog-6-tooth` | check         |
| icon-active        | Icon slug for the active state                            | ''            |
| icon-font          | Legacy option retained for compatibility                  | ''            |
| icon-font-size     | Icon size for button                                      | 0.4           |

| font-color         | Text color for button label                               | #F1F5F9       |
| border-color       | Border color of button                                    | #F1F5F9       |
| background-color   | Background color of item                                  | #202127       |
| hover-color        | Background color when button is in hover state            | #161618       |
| active-color       | Background color when button is pressed down              | #2563EB       |
| toggle             | Toggle status                                             | false         |
| toggle-state       | Setting the toggle button on/off state                    | false         |

| height             | Height of item                                            | 1             |
| width              | Width of item                                             | 1             |
| margin             | Margin around item                                        | 0 0 0 0       |

```html
<a-sxr-icon-button
	height="0.75"
	onclick="buttonActionFunction" key-code="32"
	icon="star"
	margin="0 0 0.05 0"
>
</a-sxr-icon-button>
```

### a-sxr-icon-label-button Component
#### Properties

| Property         | Description                                            | Default Value |
| --------         | ----------------------------------------------------   | ------------- |
| on               | Event that triggers onclick action                     | click         |

| icon             | SenangStart icon slug, e.g. `check`, `sparkles`        | check         |
| icon-active      | Icon slug for the active state                         | ''            |
| icon-font        | Legacy option retained for compatibility               | ''            |
| icon-font-size   | Icon size for button                                   | 0.35          |

| font-color       | Text color for button label                            | #F1F5F9       |
| value            |  			                                            | ''            |
| font-family      | Font family for button                                 | ''            |
| font-size        | Font size for button                                   | 0.2           |
| font-color       | Text color for button label                            | #F1F5F9       |
| border-color     | Border color of button                                 | #F1F5F9       |
| background-color | Background color of button                             | #202127       |
| hover-color      | Background color when button is in hover state         | #161618       |
| active-color     | Background color when button is pressed down           | #2563EB       |
| toggle           | Toggle status                                          | false         |
| toggle-state     | Setting the toggle button on/off state                 | false         |

| height           | Height of button                                       | 1             |
| width            | Width of button                                        | 1             |
| margin           | Margin around button                                   | 0 0 0 0       |

```html
<a-sxr-icon-label-button
	width="2.5" height="0.75"
	onclick="buttonActionFunction"
	icon="sparkles"
	value="icon label"
	font-family="Outfit-Regular.woff2"
	font-size="0.16"
	margin="0 0 0.05 0"
>
</a-sxr-icon-label-button>
```

### a-sxr-input Component
#### Properties

| Property           | Description                                           | Default Value  |
| --------           | ----------------------------------------------------  | -------------  |
| onclick            | Function to call on click event                       |                |
| onhover            | Function to call on hover event                       |                |
| value              | Input text value                                      |                |

| font-size          | Font size for input                                   | 0.2            |
| font-family        | Font family for input                                 | ''             |
| font-color         | Text input color                                      | #161618        |
| border-color       | Border color of input                                 | #161618        |
| background-color   | Background color of input                             | #202127        |
| border-hover-color | Border color when input is in hover state             | #202127        |
| hover-color        | Background color when input is in hover state         | #161618        |

| margin             | Margin around item                                    | 0 0 0 0        |
| height             | Height of item                                        | 1              |
| width              | Width of item                                         | 1              |

```html
<a-sxr-input
	width="2.5" height="0.75"
	onclick="inputActionFunction"
	font-family="Outfit-Regular.woff2"
	font-size="0.2"
	value="Hello Wor_"
	margin="0 0 0.05 0"
>
</a-sxr-input>
```


### a-sxr-label Component
#### Properties

| Property         | Description                                             | Default Value  |
| --------         | ------------------------------------------------------- | -------------  |
| value            |  			                                             | ''             |
| align            | text-align: 'left','center','right' 		             | 'center'       |
| anchor           | text anchor position: 'left','center','right' 	         | 'center'       |
| lineHeight       | line-height of the label                                | 0.2            |
| font-size        | Font size for input                                     | 0.2            |
| font-family      | Font family for input                                   | ''             |
| font-color       | Text input color                                        | #161618        |
| background-color | Background color of label                               | #F1F5F9        |

| text-depth       | distance from the text to label background              | 0.01           |
| height           | Height of item                                          | 1              |
| width            | Width of item                                           | 1              |
| margin           | Margin around item                                      | 0 0 0 0        |


```html
<a-sxr-label
	width="2.5" height="0.75"
	value="test label"
	font-family="Outfit-Regular.woff2"
	font-size="0.35"
	line-height="0.8"
	letter-spacing="0"
	margin="0 0 0.05 0"
>
</a-sxr-label>
```


### a-sxr-progress-bar Component
#### Properties

| Property         | Description                                               | Default Value |
| --------         | -------------------------------------------------------   | ------------- |
| background-color | Background color of progress bar                          | #202127       |
| active-color     | Color for indicating progress level                       | #2563EB       |
| height           | Height of item                                            | 1             |
| width            | Width of item                                             | 1             |
| margin           | Margin around item                                        | 0 0 0 0       |


```html
<a-sxr-progressbar 
	width="2.5" height="0.25"
	margin="0 0 0.05 0"
>
</a-sxr-progressbar>
```


### a-sxr-radio Component
#### Properties

| Property         | Description                                               | Default Value  |
| --------         | -------------------------------------------------------   | -------------- |
| on               | Event that triggers onclick action                        | click          |
| checked          |                                                           | false          |
| active           |                                                           | true           |
| toggle           | Toggle status                                             | false          |
| toggle-state     | Setting the radio button on/off state                     | false          |

| value            |  			                                               | ''             |
| font-family      | Font family for radio button                              | ''             |
| font-size        | Font size for radio button                                | 0.2            |
| font-color       | Text color for radio button label                         | #161618        |
| border-width     |                                                           | 1              |
| border-color     | Border color of radio button                              | #F1F5F9        |
| background-color | Background color of radio button                          | #F1F5F9        |
| hover-color      | Background color when radio button is in hover state      | #1B1B1F        |
| handle-color     |                                                           | #202127        |
| active-color     | Background color when radio button is pressed down        | #2563EB        |

| height           | Height of radio button                                    | 1              |
| width            | Width of radio button                                     | 1              |
| margin           | Margin around radio button                                | 0 0 0 0        |

```html
<a-sxr-radio
	width="2.5" height="0.75"
	onclick="toggleActionFunction"
	value="radio label"
	font-size="0.3"
	margin="0 0 0.05 0"
>
</a-sxr-radio>
```


### a-sxr-slider Component
#### Properties

| Property            | Description                                               | Default Value  |
| --------            | -------------------------------------------------------   | -------------  |
| active-color        |                                                           | #2563EB        |
| background-color    |                                                           | #F1F5F9        |
| border-color        |                                                           | #202127        |
| handle-color        |                                                           | #F1F5F9        |
| handle-outer-radius |                                                           | '0.17'         |
| handle-inner-radius |                                                           | '0.13'         |
| handle-outer-depth  |                                                           | '0.04'         |
| handle-inner-depth  |                                                           | '0.02'         |
| height              | Height of item                                            | 1              |
| hover-color         |                                                           | #1B1B1F        |
| left-right-padding  |                                                           | '0.25'         |
| margin              | Margin around item                                        | 0 0 0 0        |
| onclick             | Javascript function to execute on click                   |               |
| onhover             | Javascript function to execute on click                   |               |
| percent             |                                                           | '0.5'          |
| slider-bar-depth    |                                                           | '0.03'         |
| slider-bar-height   |                                                           | '0.05'         |
| top-bottom-padding  |                                                           | '0.125'        |
| width               | Width of item                                             | 1              |

```html
<a-sxr-slider 	
	width="2.5" height="0.75"
	onclick="slideActionFunction"
	percent="0.29"
	margin="0 0 0.05 0"
>
</a-sxr-slider>
```


### a-sxr-toggle Component
#### Properties

| Property         | Description                                               | Default Value  |
| --------         | -------------------------------------------------------   | -------------- |
| on               | Event that triggers onclick action                        | click          |
| checked          |                                                           | false          |
| active           |                                                           | false          |
| toggle           | Toggle status                                             | false          |
| toggle-state     | Setting the toggle toggle button on/off state             | false          |

| value            |  			                                               | ''             |
| font-family      | Font family for toggle button                             | ''             |
| font-size        | Font size for toggle button                               | 0.2            |
| font-color       | Text color for toggle button label                        | #F1F5F9        |
| border-width     |                                                           | 1              |
| border-color     | Border color of toggle button                             | #F1F5F9        |
| background-color | Background color of toggle button                         | #202127        |
| hover-color      | Background color when toggle button is in hover state     | #161618        |
| handle-color     |                                                           | #F1F5F9        |
| active-color     | Background color when toggle button is pressed down       | #2563EB        |

| height           | Height of toggle button                                   | 1              |
| width            | Width of toggle button                                    | 1              |
| margin           | Margin around toggle button                               | 0 0 0 0        |

```html
<a-sxr-toggle
	width="2.5" height="0.75"
	onclick="testToggleAction"
	value="toggle label"
	font-family="Outfit-Regular.woff2"
	font-size="0.2"
	margin="0 0 0.05 0"
>
</a-sxr-toggle>
```

### a-sxr-vertical-slider Component
#### Properties

| Property            | Description                                               | Default Value  |
| --------            | -------------------------------------------------------   | -------------  |
| active-color        |                                                           | #2563EB        |
| background-color    |                                                           | #F1F5F9        |
| border-color        |                                                           | #202127        |
| handle-color        |                                                           | #F1F5F9        |
| handle-outer-radius |                                                           | 0.17           |
| handle-inner-radius |                                                           | 0.13           |
| handle-outer-depth  |                                                           | 0.04           |
| handle-inner-depth  |                                                           | 0.02           |
| hover-color         |                                                           | #1B1B1F        |
| hover-font-size     | Font size of label indicating where user is hovering      | 0.2            |
| hover-height        |  Height of label indicating where user is hovering        | 1.0            |
| hover-margin        |  Margin of label indicating where user is hovering        | 1.0            |
| hover-percent       | Current percentage where user is hovering                 |                |
| hover-width         | Width of label indicating where user is hovering          | 1.0            |
| left-right-padding  |                                                           | 0.25           |
| margin              | Margin around item                                        | '0 0 0 0'      |
| onclick             | Javascript function to execute on click                   |                |
| onhover             | Javascript function to execute on click                   |                |
| opacity             | Transparency of the vertical slider background            | 1.0            |
| output-font-size    |  Font size of label indicating output value               | 0.2            |
| output-function     |  Name of function to calculate output value from percent  |                |
| output-height       |   Height of label indicating output value                 | 1.0            |
| output-margin       |  Margin of label indicating output value                  | '0 0 0 0'      |
| output-width        |  Width of label indicating output value                   | 1.0            |
| percent             |  Current selected slider value, from 0.0 to 1.0           | 0.5            |
| slider-bar-depth    |                                                           | 0.03           |
| slider-bar-height   |                                                           | 0.05           |
| top-bottom-padding  |                                                           | 0.125          |
| height              | Height of item                                            | 1              |
| width               | Width of item                                             | 1              |

```html
<a-sxr-slider 	
	width="2.5" height="0.75"
	onclick="slideActionFunction"
	percent="0.29"
	margin="0 0 0.05 0"
>
</a-sxr-slider>
```
