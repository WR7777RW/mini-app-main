import { useRef, useEffect } from 'react';
import { useWebViewer } from './useWebViewer'; // Adjust the import according to your project structure

export const PDFResolver = ({
    contractId,
    contractType,
    name,
    parametes,
    signers,
    onFileData,
}: any) => {

    // Reference to the PDF element
    const pdfRef = useRef<any>(null);

    // Destructure necessary functions from the useWebViewer hook
    const {
        initialize,
        instance,
        addSigners,
        getOptimizedDocument,
        exportAnnotations,
    } = useWebViewer();

    // Function to prepare data for the PDF
    const prepareData = async (data: { parametes: any }) => {
        if (!instance) return;

        // Access Core functionalities from the instance
        const { Core } = instance;
        const { documentViewer } = Core;

        // Get the document and its PDFDoc object
        const doc = documentViewer.getDocument();
        const pdfDoc = await documentViewer.getDocument().getPDFDoc();
        const docInfo = await pdfDoc.getDocInfo();

        // Set filename and document info
        doc.setFilename(name ?? "");
        docInfo.setTitle(name ?? "");
        docInfo.setSubject(
            JSON.stringify({
                contractId,
                contractType,
            })
        );

        // Retrieve metadata and annotations from the document
        const metadata = await doc.getMetadata();
        const xfdfString = await exportAnnotations();

        // Options for getting file data from the PDF viewer
        const options = {
            finishedWithDocument: false,
            printDocument: false,
            downloadType: "pdf",
            includeAnnotations: false,
            flatten: false,
        };

        // Get original PDF file data without annotations
        const fileData = await doc.getFileData(options);

        // Optimize the document and convert it to a buffer
        const buffer = await getOptimizedDocument(new Uint8Array(fileData));

        // Create a Blob from the buffer
        const fileBlob = new Blob([buffer], { type: "application/pdf" });

        // Convert Blob to base64 string
        const fileString = (await blobToBase64(fileBlob)) as string;
        const payload = {
            file: fileString.replace("data:application/pdf;base64,", ""),
            annotations: xfdfString,
        };

        // Pass the payload to the onFileData callback
        onFileData?.(payload);
    };

    useEffect(() => {
        // Initialize the PDF viewer instance if it is not already initialized
        if (!instance && pdfRef.current) {
            async function init() {
                const response = await fetch('/path/to/your/document.docx'); // Replace with your actual DOCX file path
                const arrayBuffer = await response.arrayBuffer();
                const docxBlob = new Blob([arrayBuffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
                const docxBase64 = await blobToBase64(docxBlob);

                await initialize(
                    pdfRef.current,
                    `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxBase64}`
                );

                addSigners(signers);
            }

            init();
        }
    }, [instance]);

    useEffect(() => {
        // Add event listeners for document rendering and annotation changes
        if (instance) {
            const { Core } = instance;
            const { documentViewer, annotationManager } = Core;

            // Event listener for when the document finishes rendering
            documentViewer.addEventListener("finishedRendering", () => {
                console.log("finishedRendering");
                prepareData({
                    parametes,
                });
            });

            // Event listener for annotation changes
            annotationManager.addEventListener(
                "annotationChanged",
                async (annotations, action, { imported }) => {
                    if (!imported) {
                        if (action == "add") {
                            annotationManager.selectAnnotations(annotations);

                            const ANNOTATION_SUBJECT_PREFIX = "delegate";

                            // Remove annotations that are not created from Delegate
                            annotations.forEach((annotation: any) => {
                                if (!annotation.Subject.startsWith(ANNOTATION_SUBJECT_PREFIX)) {
                                    annotationManager.deleteAnnotation(annotation);
                                }
                            });
                        }
                        const annotationSubjects =
                            annotationManager
                                .getAnnotationsList()
                                .map((annotation) => annotation.Subject) || [];
                    }
                }
            );

            const annotationSubjects =
                annotationManager
                    .getAnnotationsList()
                    .map((annotation) => annotation.Subject) || [];
        }
    }, [instance]);

    // Function to convert Blob to Base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Function to compute SHA-256 hash
    const computeHash = async (data: string): Promise<string> => {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    return (

        <div ref= { pdfRef } className = {`h-[800px]`
}> </div>
  );
};

// For sign annotations
const xfdfString = await exportAnnotations(); // Get annotations (needs to be used by the user)
const contractHash = 'your_contract_hash_here'; // Replace with your actual contract hash
const hash = await computeHash(contractHash + xfdfString); // Compute SHA-256 hash with contract hash and annotations

// Prompt the user for a digital signature
const signature = await account.signMessage(
    `Delegate is requesting your digital signature for this contract.\nHash: ${hash}`
);
console.log(`Signature: ${signature}`);
