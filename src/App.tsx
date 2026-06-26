import './App.css';
import React, {createRef} from 'react';
import {AnnotationProfileCache, AnnotationToolbar, DefaultToolbar, DefaultTools, JadiceViewer, ServerConnection, Viewer, ViewerProvider} from "@levigo/webtoolkit-ng-client";
import {Nullable} from "@levigo/utility-types"
import {Action, Toolbar, ToolbarUtils} from "@levigo/jadice-common-components"
import {JadiceIcon} from "@levigo/jadice-web-icons";
import {map, of, take} from "rxjs";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "jadice-toolbar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "jadice-annotation-toolbar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

// Muss zum saveAnnotationsHandlerId (Bean-Name) und Stream-Ziel des Backends passen.
const SAVE_STREAM_ID = "test93.xml";
const SAVE_ANNOTATIONS_HANDLER_ID = "SaveJadiceAnnotationsHandler";

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

    // Dokument samt zugehoeriger Annotationen vom mitgelieferten test-server
    // (test-server-basic-auth, Port 3000) laden. annotationUrisList ordnet jeder
    // URI in uris eine Liste von Annotations-URIs zu. Der saveStreamId beim
    // Speichern (siehe buildSaveAnnotationsAction) referenziert dieselbe Datei.
    this.viewer.setDocumentFromSource({
      uris: ["http://localhost:3000/PDFUA.pdf"],
      annotationUrisList: [["http://localhost:3000/test93.xml"]],
      password: null
    } as any);

    const toolbar = this.toolbarRef.current as Toolbar<Viewer>;
    // DefaultToolbar.CONFIG uebernehmen und um einen "Annotationen speichern"-Button
    // in den auxiliaryActions (rechte Seite der Toolbar) erweitern.
    const toolbarConfig = {
      ...DefaultToolbar.CONFIG,
      auxiliaryActions: [
        ...((DefaultToolbar.CONFIG as any).auxiliaryActions ?? []),
        ToolbarUtils.makeButton(this.buildSaveAnnotationsAction(viewer)),
      ],
    };
    toolbar.configure(toolbarConfig as Parameters<typeof toolbar.configure>[0]);
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

  // Toolbar-Action zum Speichern der Annotationen. Der Button ist nur aktiv,
  // wenn ein Dokument geladen ist.
  private buildSaveAnnotationsAction(viewer: JadiceViewer): Action<Viewer> {
    return {
      icon: JadiceIcon.DEFAULT_SAVE_ANNO_A,
      label: {translate: false, content: "Save annotations"},
      isEnabled$: () => viewer.document$().pipe(map(doc => doc != null)),
      handle: () => this.saveAnnotations(viewer),
    };
  }

  // Erzeugt einen Snapshot des aktuellen Dokuments (inkl. Annotationen) und
  // schickt ihn ueber die SAVE_ANNOS-Konversation an den SaveJadiceAnnotationsHandler
  // im Backend, der die Annotationen an den test-server zurueckschreibt.
  private saveAnnotations(viewer: JadiceViewer) {
    const dto = (viewer.getDocument() as any)?.toSnapshot().toDTO();
    if (!dto) {
      return;
    }
    ServerConnection.get().initConversation("SAVE_ANNOS", {
      doc: dto,
      saveStreamId: SAVE_STREAM_ID,
      saveAnnotationsHandlerId: SAVE_ANNOTATIONS_HANDLER_ID,
      annoFormat: "JADICE",
    }).pipe(take(1)).subscribe(() => window.alert("Annotations saved"));
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
