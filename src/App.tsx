import './App.css';
import React, {createRef} from 'react';
import {AnnotationProfileCache, AnnotationToolbar, DefaultToolbar, DefaultTools, JadiceViewer, Viewer, ViewerProvider} from "@levigo/webtoolkit-ng-client";
import {Nullable} from "@levigo/utility-types"
import {Toolbar} from "@levigo/jadice-common-components"
import {of} from "rxjs";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "jadice-toolbar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "jadice-annotation-toolbar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

class App extends React.Component {
  divRef: any = createRef();
  toolbarRef: any = createRef();
  annotationToolbarRef: any = createRef();
  viewer: Nullable<JadiceViewer> = null;

  componentDidMount() {
    if (this.viewer != null) {
      return;
    }

    const node = this.divRef.current as HTMLElement;
    const viewer = new JadiceViewer(node);

    this.viewer = viewer;

    // Der JadiceViewer-Konstruktor registriert zwar alle Default-Tools, aktiviert
    // aber nur LINK. Passive Tools wie Mausrad-Scrollen und Textselektion muessen
    // explizit per setEnabled aktiviert werden. In Angular uebernimmt das die
    // MultiModeViewerComponent (enableDefaultTools()); ohne Komponente machen wir es hier.
    const toolManager = viewer.getToolManager();
    [
      DefaultTools.PAN,
      DefaultTools.PAN_FORCE_MOUSE,
      DefaultTools.PAN_FORCE_TOUCH,
      DefaultTools.MOUSE_SCROLL,      // Scrollen per Mausrad
      DefaultTools.MOUSE_WHEEL_ZOOM,  // Zoom per Strg + Mausrad
      DefaultTools.DOUBLE_TAP_ZOOM,
      DefaultTools.PINCH_ZOOM,
      DefaultTools.HIGHLIGHT,
      DefaultTools.TEXT_SELECTION,    // Textselektion
    ].forEach(tool => toolManager.setEnabled(tool, true));

    this.viewer.setDocumentFromSource({uri: "https://www.levigo.de/fileadmin/download/jadicewebtoolkit.pdf", password: null});

    const toolbar = this.toolbarRef.current as Toolbar<Viewer>;
    toolbar.configure(DefaultToolbar.CONFIG as Parameters<typeof toolbar.configure>[0]);
    toolbar.setParamsProvider({
      getParams() {
        return viewer;
      },

      getParams$() {
        return of(viewer);
      }
    });

    const annotationToolbar = this.annotationToolbarRef.current as AnnotationToolbar;
    // Wenn man unten nicht die Weite der Taskleiste manuell einstellen möchte, kann man das Element auch überschreiben
    // und die Buttons auf einem Grid anlegen:
    // const verticalStyle = document.createElement('style');
    // verticalStyle.textContent = '.annotations-list { display: grid; grid-template-columns: repeat(2, auto); }';
    // annotationToolbar.shadowRoot?.appendChild(verticalStyle);

    annotationToolbar.setViewerProvider(new class extends ViewerProvider {
      getViewer() { return viewer; }
      getViewer$() { return of(viewer); }
    }());
    AnnotationProfileCache.get().loadAndCache("JWT-Demo-Profile").then((profile) => {
      annotationToolbar.setProfile(profile.data);
    });
  }

  componentWillUnmount() {
    (this.annotationToolbarRef.current as AnnotationToolbar)?.dispose();
  }

  render() {
    return (
        <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "column"}}>
          <jadice-toolbar ref={this.toolbarRef}></jadice-toolbar>
          <div style={{flex: 1, display: "flex", flexDirection: "row"}}>
            <jadice-annotation-toolbar ref={this.annotationToolbarRef} style={{width: "88px", background: "var(--jadice-annotation-panel-background)"}}></jadice-annotation-toolbar>
            <div ref={this.divRef} style={{flex: 1}}></div>
          </div>
        </div>
    );
  }
}

export default App;
