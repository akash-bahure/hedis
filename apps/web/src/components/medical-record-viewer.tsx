import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Flag,
  Highlighter,
  FileText,
  Image as ImageIcon,
  Calendar,
  User,
  MapPin,
  Phone,
  Cake,
  Activity,
  Heart,
  Stethoscope,
  ClipboardList,
  X,
  Check,
  AlertCircle,
  Bookmark,
  MessageSquare,
  Grid3x3,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface MedicalDocument {
  id: string;
  type:
    | "Progress Note"
    | "Lab Result"
    | "Radiology"
    | "Prescription"
    | "Consultation"
    | "Discharge Summary";
  dateOfService: string;
  provider: string;
  facility: string;
  pageCount: number;
  thumbnailUrl?: string;
  flagged: boolean;
  reviewed: boolean;
}

interface Annotation {
  id: string;
  page: number;
  text: string;
  timestamp: string;
}

interface Bookmark {
  id: string;
  documentId: string;
  page: number;
  note: string;
}

interface PatientInfo {
  memberId: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  address: string;
  phone: string;
  productLine: "Medicare" | "Medicaid" | "Commercial" | "Exchange";
  primaryCareProvider: string;
  diagnoses: string[];
}

const mockPatient: PatientInfo = {
  memberId: "MBR-789456",
  name: "Anderson, Jennifer K.",
  dateOfBirth: "1958-04-12",
  age: 67,
  gender: "Female",
  address: "1234 Oak Street, Springfield, IL 62701",
  phone: "(217) 555-0123",
  productLine: "Medicare",
  primaryCareProvider: "Dr. Sarah Martinez, MD",
  diagnoses: [
    "Type 2 Diabetes Mellitus",
    "Hypertension",
    "Hyperlipidemia",
    "Osteoarthritis",
  ],
};

const mockDocuments: MedicalDocument[] = [
  {
    id: "DOC-001",
    type: "Progress Note",
    dateOfService: "2025-12-15",
    provider: "Dr. Sarah Martinez",
    facility: "Springfield Primary Care",
    pageCount: 3,
    flagged: false,
    reviewed: true,
  },
  {
    id: "DOC-002",
    type: "Lab Result",
    dateOfService: "2025-12-14",
    provider: "Quest Diagnostics",
    facility: "Quest Lab - Springfield",
    pageCount: 2,
    flagged: false,
    reviewed: true,
  },
  {
    id: "DOC-003",
    type: "Radiology",
    dateOfService: "2025-11-28",
    provider: "Dr. Michael Chen",
    facility: "Springfield Imaging Center",
    pageCount: 5,
    flagged: true,
    reviewed: false,
  },
  {
    id: "DOC-004",
    type: "Prescription",
    dateOfService: "2025-11-20",
    provider: "Dr. Sarah Martinez",
    facility: "Springfield Primary Care",
    pageCount: 1,
    flagged: false,
    reviewed: true,
  },
  {
    id: "DOC-005",
    type: "Consultation",
    dateOfService: "2025-11-05",
    provider: "Dr. Robert Johnson",
    facility: "Cardiology Associates",
    pageCount: 4,
    flagged: false,
    reviewed: false,
  },
  {
    id: "DOC-006",
    type: "Progress Note",
    dateOfService: "2025-10-18",
    provider: "Dr. Sarah Martinez",
    facility: "Springfield Primary Care",
    pageCount: 2,
    flagged: false,
    reviewed: true,
  },
  {
    id: "DOC-007",
    type: "Lab Result",
    dateOfService: "2025-10-17",
    provider: "LabCorp",
    facility: "LabCorp - Springfield",
    pageCount: 3,
    flagged: false,
    reviewed: true,
  },
  {
    id: "DOC-008",
    type: "Discharge Summary",
    dateOfService: "2025-09-22",
    provider: "Dr. Emily Davis",
    facility: "Memorial Hospital",
    pageCount: 6,
    flagged: true,
    reviewed: false,
  },
];

export function MedicalRecordViewer() {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showPatientPanel, setShowPatientPanel] = useState(true);
  const [showDocumentList, setShowDocumentList] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [highlightMode, setHighlightMode] = useState(true); // NLP highlighting on by default
  const [annotationMode, setAnnotationMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [newAnnotation, setNewAnnotation] = useState("");

  const currentDocument = mockDocuments[currentDocumentIndex];

  const handleNextDocument = () => {
    if (currentDocumentIndex < mockDocuments.length - 1) {
      setCurrentDocumentIndex(currentDocumentIndex + 1);
      setCurrentPage(1);
      setRotation(0);
    }
  };

  const handlePreviousDocument = () => {
    if (currentDocumentIndex > 0) {
      setCurrentDocumentIndex(currentDocumentIndex - 1);
      setCurrentPage(1);
      setRotation(0);
    }
  };

  const handleNextPage = () => {
    if (currentPage < currentDocument.pageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 25);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 25);
    }
  };

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  const toggleFlag = () => {
    // In a real app, this would update the document's flagged status
    console.log("Toggle flag for document:", currentDocument.id);
  };

  const markAsReviewed = () => {
    // In a real app, this would update the document's reviewed status
    console.log("Mark as reviewed:", currentDocument.id);
  };

  const addBookmark = () => {
    const bookmark: Bookmark = {
      id: `BM-${Date.now()}`,
      documentId: currentDocument.id,
      page: currentPage,
      note: `Bookmarked: ${currentDocument.type} - Page ${currentPage}`,
    };
    setBookmarks([...bookmarks, bookmark]);
  };

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
  };

  const isPageBookmarked = () => {
    return bookmarks.some(
      (b) => b.documentId === currentDocument.id && b.page === currentPage,
    );
  };

  const addAnnotation = () => {
    if (newAnnotation.trim()) {
      const annotation: Annotation = {
        id: `ANN-${Date.now()}`,
        page: currentPage,
        text: newAnnotation,
        timestamp: new Date().toLocaleString(),
      };
      setAnnotations([...annotations, annotation]);
      setNewAnnotation("");
      setAnnotationMode(false);
    }
  };

  const currentPageAnnotations = annotations.filter(
    (a) => a.page === currentPage,
  );

  const getDocumentTypeIcon = (type: MedicalDocument["type"]) => {
    switch (type) {
      case "Progress Note":
        return FileText;
      case "Lab Result":
        return Activity;
      case "Radiology":
        return ImageIcon;
      case "Prescription":
        return ClipboardList;
      case "Consultation":
        return Stethoscope;
      case "Discharge Summary":
        return Heart;
      default:
        return FileText;
    }
  };

  const getDocumentTypeBadge = (type: MedicalDocument["type"]) => {
    const colors = {
      "Progress Note": "bg-blue-500/10 text-blue-600",
      "Lab Result": "bg-green-500/10 text-green-600",
      Radiology: "bg-purple-500/10 text-purple-600",
      Prescription: "bg-orange-500/10 text-orange-600",
      Consultation: "bg-teal-500/10 text-teal-600",
      "Discharge Summary": "bg-pink-500/10 text-pink-600",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[type]}`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Medical Record Viewer
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mockPatient.name} • {mockPatient.memberId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPatientPanel(!showPatientPanel)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showPatientPanel
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
              title="Toggle patient information"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showThumbnails
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
              title="Toggle page thumbnails"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDocumentList(!showDocumentList)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showDocumentList
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
              title="Toggle document list"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Patient Information Panel */}
        {showPatientPanel && (
          <div className="w-64 bg-card border-r border-border flex flex-col">
            <div className="sticky top-0 p-4 border-b border-border bg-card z-10">
              <h3 className="text-sm font-semibold text-foreground">
                Patient Information
              </h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">Name</div>
                      <div className="text-sm text-foreground font-medium">
                        {mockPatient.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Member ID
                      </div>
                      <div className="text-sm text-foreground font-medium">
                        {mockPatient.memberId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Cake className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Date of Birth
                      </div>
                      <div className="text-sm text-foreground font-medium">
                        {mockPatient.dateOfBirth} ({mockPatient.age} years)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Gender
                      </div>
                      <div className="text-sm text-foreground font-medium">
                        {mockPatient.gender}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Address
                      </div>
                      <div className="text-sm text-foreground">
                        {mockPatient.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <div className="text-sm text-foreground font-medium">
                        {mockPatient.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Heart className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Product Line
                      </div>
                      <div className="text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-xs font-medium">
                          {mockPatient.productLine}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Stethoscope className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Primary Care Provider
                      </div>
                      <div className="text-sm text-foreground">
                        {mockPatient.primaryCareProvider}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Diagnoses */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Active Diagnoses
                  </h3>
                  <div className="space-y-2">
                    {mockPatient.diagnoses.map((diagnosis, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        <div className="text-sm text-foreground">
                          {diagnosis}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Document Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Document Toolbar */}
          <div className="bg-muted/30 border-b border-border px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Document Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePreviousDocument}
                  disabled={currentDocumentIndex === 0}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm text-foreground">
                  Document{" "}
                  <span className="font-semibold">
                    {currentDocumentIndex + 1}
                  </span>{" "}
                  of {mockDocuments.length}
                </div>
                <button
                  onClick={handleNextDocument}
                  disabled={currentDocumentIndex === mockDocuments.length - 1}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-border mx-2"></div>

                {/* Page Navigation */}
              </div>

              {/* Viewer Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="text-sm text-foreground font-medium w-16 text-center">
                  {zoomLevel}%
                </div>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-border mx-2"></div>

                <button
                  onClick={handleRotate}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                  title="Rotate document"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setHighlightMode(!highlightMode)}
                  className={`p-2 rounded-lg border transition-colors ${
                    highlightMode
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                  title="Toggle NLP evidence highlighting"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setAnnotationMode(!annotationMode)}
                  className={`p-2 rounded-lg border transition-colors ${
                    annotationMode
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                  title="Add annotation"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  onClick={() =>
                    isPageBookmarked()
                      ? removeBookmark(
                          bookmarks.find(
                            (b) =>
                              b.documentId === currentDocument.id &&
                              b.page === currentPage,
                          )?.id || "",
                        )
                      : addBookmark()
                  }
                  className={`p-2 rounded-lg border transition-colors ${
                    isPageBookmarked()
                      ? "border-blue-500 bg-blue-500/10 text-blue-600"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                  title={
                    isPageBookmarked()
                      ? "Remove bookmark"
                      : "Bookmark this page"
                  }
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-border mx-2"></div>

                <button
                  onClick={toggleFlag}
                  className={`p-2 rounded-lg border transition-colors ${
                    currentDocument.flagged
                      ? "border-orange-500 bg-orange-500/10 text-orange-600"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                  title="Flag for review"
                >
                  <Flag className="w-4 h-4" />
                </button>

                <button
                  onClick={markAsReviewed}
                  className={`p-2 rounded-lg border transition-colors ${
                    currentDocument.reviewed
                      ? "border-green-500 bg-green-500/10 text-green-600"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                  title="Mark as reviewed"
                >
                  <Check className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-border mx-2"></div>

                <button className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
                  <Printer className="w-4 h-4" />
                </button>

                <button className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Document Display Area */}
          <div className="flex-1 overflow-auto bg-muted/20 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Document Metadata */}
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getDocumentTypeBadge(currentDocument.type)}
                    {currentDocument.flagged && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded text-xs font-medium">
                        <Flag className="w-3 h-3" />
                        Flagged
                      </span>
                    )}
                    {currentDocument.reviewed && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Reviewed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentDocument.id}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Date of Service
                    </div>
                    <div className="text-foreground font-medium">
                      {currentDocument.dateOfService}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Provider
                    </div>
                    <div className="text-foreground font-medium">
                      {currentDocument.provider}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Facility
                    </div>
                    <div className="text-foreground font-medium">
                      {currentDocument.facility}
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Document Viewer */}
              <div
                className="bg-white border border-border rounded-lg shadow-sm overflow-hidden"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                  transition: "transform 0.3s ease",
                }}
              >
                <div className="aspect-[8.5/11] bg-white p-12 text-gray-800">
                  <div className="space-y-6">
                    {/* Simulated Medical Document Content */}
                    <div className="border-b-2 border-gray-800 pb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {currentDocument.facility}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {currentDocument.type}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold">Patient:</div>
                        <div>{mockPatient.name}</div>
                      </div>
                      <div>
                        <div className="font-semibold">DOB:</div>
                        <div>{mockPatient.dateOfBirth}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Member ID:</div>
                        <div>{mockPatient.memberId}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Date of Service:</div>
                        <div>{currentDocument.dateOfService}</div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-semibold mb-1">
                          Chief Complaint:
                        </div>
                        <div className="text-gray-700">
                          Follow-up visit for diabetes management and
                          hypertension control.
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold mb-1">
                          History of Present Illness:
                        </div>
                        <div className="text-gray-700">
                          Patient presents for routine follow-up. Reports good
                          compliance with medication regimen. Blood glucose
                          levels have been stable, ranging from{" "}
                          <span
                            className={
                              highlightMode ? "bg-yellow-200 px-0.5" : ""
                            }
                          >
                            110-140 mg/dL
                          </span>
                          . Blood pressure readings at home average{" "}
                          <span
                            className={
                              highlightMode ? "bg-yellow-200 px-0.5" : ""
                            }
                          >
                            135/82 mmHg
                          </span>
                          .
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold mb-1">
                          Physical Examination:
                        </div>
                        <div className="text-gray-700">
                          Vital Signs: BP{" "}
                          <span
                            className={
                              highlightMode ? "bg-yellow-200 px-0.5" : ""
                            }
                          >
                            138/84
                          </span>
                          , HR{" "}
                          <span
                            className={
                              highlightMode ? "bg-green-200 px-0.5" : ""
                            }
                          >
                            72
                          </span>
                          , Temp{" "}
                          <span
                            className={
                              highlightMode ? "bg-green-200 px-0.5" : ""
                            }
                          >
                            98.6°F
                          </span>
                          , Weight{" "}
                          <span
                            className={
                              highlightMode ? "bg-yellow-200 px-0.5" : ""
                            }
                          >
                            178 lbs
                          </span>
                          <br />
                          General: Alert and oriented, in no acute distress
                          <br />
                          Cardiovascular: Regular rate and rhythm, no murmurs
                          <br />
                          Respiratory: Clear to auscultation bilaterally
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold mb-1">
                          Assessment & Plan:
                        </div>
                        <div className="text-gray-700">
                          1.{" "}
                          <span
                            className={
                              highlightMode ? "bg-blue-200 px-0.5" : ""
                            }
                          >
                            Type 2 Diabetes Mellitus
                          </span>{" "}
                          - Continue current regimen,{" "}
                          <span
                            className={
                              highlightMode ? "bg-yellow-200 px-0.5" : ""
                            }
                          >
                            HbA1c target &lt;7%
                          </span>
                          <br />
                          2.{" "}
                          <span
                            className={
                              highlightMode ? "bg-blue-200 px-0.5" : ""
                            }
                          >
                            Hypertension
                          </span>{" "}
                          - Blood pressure adequately controlled, continue
                          medications
                          <br />
                          3.{" "}
                          <span
                            className={
                              highlightMode ? "bg-blue-200 px-0.5" : ""
                            }
                          >
                            Hyperlipidemia
                          </span>{" "}
                          - Continue statin therapy, check lipid panel at next
                          visit
                          <br />
                          4. Follow-up in{" "}
                          <span
                            className={
                              highlightMode ? "bg-green-200 px-0.5" : ""
                            }
                          >
                            3 months
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-300 text-xs text-gray-600">
                      <div>Provider: {currentDocument.provider}</div>
                      <div className="mt-1">
                        Page {currentPage} of {currentDocument.pageCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Annotation Input */}
              {annotationMode && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-900">
                      Add Annotation
                    </h4>
                  </div>
                  <textarea
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                    placeholder="Type your note about this page..."
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={addAnnotation}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => {
                        setAnnotationMode(false);
                        setNewAnnotation("");
                      }}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Current Page Annotations */}
              {currentPageAnnotations.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Page Annotations
                  </h4>
                  <div className="space-y-2">
                    {currentPageAnnotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-xs text-amber-700 font-medium">
                            Note
                          </div>
                          <div className="text-xs text-amber-600">
                            {annotation.timestamp}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          {annotation.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookmarks for current document */}
              {bookmarks.filter((b) => b.documentId === currentDocument.id)
                .length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Document Bookmarks
                  </h4>
                  <div className="space-y-2">
                    {bookmarks
                      .filter((b) => b.documentId === currentDocument.id)
                      .map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="w-full text-left bg-blue-50 border border-blue-200 rounded-lg p-2 hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => setCurrentPage(bookmark.page)}
                              className="flex items-center gap-2 flex-1 text-left"
                            >
                              <Bookmark className="w-3 h-3 text-blue-600" />
                              <span className="text-sm text-blue-900 font-medium">
                                Page {bookmark.page}
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBookmark(bookmark.id);
                              }}
                              className="p-1 hover:bg-blue-200 rounded flex-shrink-0"
                              aria-label="Remove bookmark"
                            >
                              <X className="w-3 h-3 text-blue-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Thumbnails Panel */}
        {showThumbnails && (
          <div className="w-48 bg-card border-l border-border flex flex-col">
            <div className="p-3 border-b border-border flex-shrink-0">
              <h3 className="text-sm font-semibold text-foreground">Pages</h3>
            </div>
            <div className="p-3 pt-0 overflow-y-auto flex-1">
              <div className="space-y-3 pr-1">
                {Array.from(
                  { length: currentDocument.pageCount },
                  (_, i) => i + 1,
                ).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  const hasBookmark = bookmarks.some(
                    (b) =>
                      b.documentId === currentDocument.id && b.page === pageNum,
                  );
                  const hasAnnotation = annotations.some(
                    (a) => a.page === pageNum,
                  );

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-full border-2 rounded-lg overflow-hidden transition-all ${
                        isActive
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {/* Thumbnail Preview */}
                      <div className="aspect-[8.5/11] bg-white p-2 text-[6px] leading-tight text-gray-600">
                        <div className="border-b border-gray-300 pb-1 mb-1 font-semibold">
                          {currentDocument.facility}
                        </div>
                        <div className="space-y-0.5">
                          <div>Patient: {mockPatient.name}</div>
                          <div>DOB: {mockPatient.dateOfBirth}</div>
                          <div>DOS: {currentDocument.dateOfService}</div>
                        </div>
                      </div>

                      {/* Page Info */}
                      <div
                        className={`px-2 py-1.5 text-center ${isActive ? "bg-primary text-white" : "bg-muted"}`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs font-medium">
                            Page {pageNum}
                          </span>
                          {hasBookmark && <Bookmark className="w-3 h-3" />}
                          {hasAnnotation && (
                            <MessageSquare className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Document List Panel */}
        {showDocumentList && (
          <div className="w-80 bg-card border-l border-border flex flex-col">
            <div className="p-4 border-b border-border flex-shrink-0">
              <h3 className="text-sm font-semibold text-foreground">
                All Documents ({mockDocuments.length})
              </h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                {mockDocuments.map((doc, index) => {
                  const Icon = getDocumentTypeIcon(doc.type);
                  const isActive = index === currentDocumentIndex;

                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setCurrentDocumentIndex(index);
                        setCurrentPage(1);
                        setRotation(0);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div
                              className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}
                            >
                              {doc.type}
                            </div>
                            {doc.flagged && (
                              <Flag className="w-3 h-3 text-orange-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {doc.dateOfService}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {doc.provider}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {doc.pageCount} pages
                            </span>
                            {doc.reviewed && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-600 rounded text-xs">
                                <Check className="w-2.5 h-2.5" />
                                Reviewed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
