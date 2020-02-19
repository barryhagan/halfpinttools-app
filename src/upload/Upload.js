import React, { Component } from "react";
import Dropzone from "../dropzone/Dropzone";
import "./Upload.css";
import Progress from "../progress/Progress";
import uploadIcon from "./baseline-check_circle_outline-24px.svg";

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false,
      pdfUrl: null
    };

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.renderActions = this.renderActions.bind(this);
  }

  onFilesAdded(files) {
    this.setState(prevState => ({
      files: prevState.files.concat(files)
    }));
  }

  uploadFiles() {
    this.setState({ uploadProgress: {}, uploading: true });
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://ac6gag1rsl.execute-api.us-east-2.amazonaws.com/Prod/api/consignor/createlabels"
    );

    const file = this.state.files.pop();
    const formData = new FormData();
    formData.append("file", file, file.name);
    xhr.send(formData);

    xhr.onload = () => {
      const copy = { ...this.state.uploadProgress };
      if (xhr.status === 200) {
        copy[file.name] = { state: "done", percentage: 100 };
        this.setState({
          successfullUploaded: true,
          uploading: false,
          pdfUrl: JSON.parse(xhr.response).pdfUrl
        });
      } else {
        copy[file.name] = { state: "error", percentage: 0 };
      }
      this.setState({ uploadProgress: copy });
    };

    xhr.onprogress = event => {
      if (event.lengthComputable) {
        const copy = { ...this.state.uploadProgress };
        copy[file.name] = {
          state: "pending",
          percentage: (event.loaded / event.total) * 100
        };
        this.setState({ uploadProgress: copy });
      }
    };

    xhr.onerror = () => {
      const copy = { ...this.state.uploadProgress };
      copy[file.name] = { state: "error", percentage: 0 };
      this.setState({ uploadProgress: copy });
    };
  }

  renderProgress(file) {
    const uploadProgress = this.state.uploadProgress[file.name];
    if (this.state.uploading || this.state.successfullUploaded || true) {
      return (
        <div className="ProgressWrapper">
          <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
          <img
            className="CheckIcon"
            alt="done"
            src={uploadIcon}
            style={{
              opacity:
                uploadProgress && uploadProgress.state === "done" ? 0.5 : 0
            }}
          />
        </div>
      );
    }
  }

  renderActions() {
    if (this.state.successfullUploaded && this.state.pdfUrl) {
      return (
        <a href={this.state.pdfUrl}>
          <button>Download PDF</button>
        </a>
      );
    }
    return (
      <button
        disabled={this.state.files.length < 1 || this.state.uploading}
        onClick={this.uploadFiles}
      >
        Create PDF
      </button>
    );
  }

  render() {
    return (
      <div className="Upload">
        <h2>Half Pint Consignor Label Maker</h2>
        <div className="Title">STEP 1</div>
        <div>
          Create your inventory spreadsheet. You can download an example to get
          started{" "}
          <a
            href={process.env.PUBLIC_URL + "/Consignor_Inventory_TEMPLATE.xlsx"}
          >
            here
          </a>
          .
        </div>
        <div className="Title">STEP 2</div>
        <div>
          Upload your completed inventory spreadsheet and create your PDF.
        </div>

        {!this.state.pdfUrl && (
          <div className="Content">
            <div>
              <Dropzone
                onFilesAdded={this.onFilesAdded}
                disabled={
                  this.state.files.length > 0 ||
                  this.state.uploading ||
                  this.state.successfullUploaded
                }
              />
            </div>
            <div className="Files">
              {this.state.files.map(file => {
                return (
                  <div key={file.name} className="Row">
                    <span className="Filename">{file.name}</span>
                    {this.renderProgress(file)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="Actions">{this.renderActions()}</div>
      </div>
    );
  }
}

export default Upload;
