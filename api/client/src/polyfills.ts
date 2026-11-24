


/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 */

 // (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 // (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 // (window as any).__zone_symbol__BLACK_LISTED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames

 /*
 * in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 * with the following flag, it will bypass `zone.js` patch for IE/Edge
 */
// (window as any).__Zone_enable_cross_context_check = true;

 // Used for reflect-metadata in JIT. If you use AOT (and only Angular decorators), you can remove.
 import 'core-js/proposals/reflect-metadata';

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.



/***************************************************************************************************
 * APPLICATION IMPORTS
 */
(window as any).global = window;
// cytoscape-grid-guide assigns the undeclared `calculateOffset` and `padding`; the v21 build runs it in
// strict mode, where that throws unless the globals already exist.
(window as any).calculateOffset = undefined;
(window as any).padding = undefined;

/***************************************************************************************************
 * Load `$localize` onto the global scope - used by @ng-bootstrap/ng-bootstrap.
 */
import '@angular/localize/init';
