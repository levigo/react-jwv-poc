import './App.css';
import React, {createRef} from 'react';
import {DefaultToolbar, JadiceViewer, Viewer, ViewerProvider} from "@levigo/webtoolkit-ng-client";
import {Nullable} from "@levigo/utility-types"
import {Toolbar} from "@levigo/jadice-common-components"
import {of} from "rxjs";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "jadice-toolbar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

class App extends React.Component {
  divRef: any = createRef();
  toolbarRef: any = createRef();
  viewer: Nullable<JadiceViewer> = null;

  componentDidMount() {
    if (this.viewer != null) {
      return;
    }

    const node = this.divRef.current as HTMLElement;
    const viewer = new JadiceViewer(node);

    this.viewer = viewer;
    this.viewer.setDocumentFromSource({uri: "https://www.levigo.de/fileadmin/download/jadicewebtoolkit.pdf", password: null});

    const toolbar = this.toolbarRef.current as Toolbar<Viewer>;
    toolbar.configure(DefaultToolbar.CONFIG);
    toolbar.setParamsProvider({
      getParams() {
        return viewer;
      },

      getParams$() {
        return of(viewer);
      }
    })
  }

  render() {
    return (
        <div ref={this.divRef} style={{width: "100%", height: "100%", display: "flex", flexDirection: "column"}}>
          <jadice-toolbar ref={this.toolbarRef}></jadice-toolbar>
        </div>
    );
  }
}

export default App;
