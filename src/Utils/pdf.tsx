import { ParticleProvider } from "@particle-network/provider";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Core, WebViewerInstance } from "@pdftron/webviewer";
import { WalletClient } from "wagmi";
import {
  ApplicantType,
  RoleType,
  getSignerAndProviderByWalletClient,
} from "./api2";

const PDFTRON_LICENSE_KEY = process.env.NEXT_PUBLIC_PDFTRON_LICENSE_KEY;
const ANNOTATION_SUBJECT_PREFIX = "delegate";
export interface Signer {
  action: string;
  actionAt: number;
  levelName: string;
  message: null | string;
  signatoryId: string;
  parameters: {
    firstName: string;
    lastName: string;
    id: string;

    applicant: {
      info?: {
        firstNameEn?: string;
        lastNameEn?: string;
        [key: string]: any;
      };
      fixedInfo?: {
        firstNameEn: string;
        lastNameEn: string;
        [key: string]: any;
      };
      [key: string]: any;
      
    };
  };
  email?: string | null;
  role: number;
  roleName: string;
  roleType?: RoleType;
  type: string;
}

export interface AnnotationData {
  type: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  parameters: any;
  pageNumber: number;
}

interface EthClientProps {
  ethWalletClient: WalletClient;
  particleProvider: ParticleProvider;
  isParticle: boolean;
}

interface TonClientProps {
  address: string;
}

interface WebViewerProps {
  instance: WebViewerInstance | null;
  initialize: (element: HTMLElement, initialDoc: any) => Promise<null>;
  loadDocument: (file: File | string) => Promise<boolean>;
  mergeDocument: (file: File | string) => Promise<boolean>;
  exportAnnotations: () => Promise<string>;
  addSigners: (signers: Signer[]) => void;
  addSigner: (signer: Signer) => void;
  removeSigner: (signer: Signer) => void;
  getOptimizedDocument: (buffer: Uint8Array) => Promise<Uint8Array>;
  loadSignFields: (
    annotations: Core.Annotations.Annotation[],
    signer: Signer,
    options: {
      ethClientProps?: EthClientProps;
      tonClientProps?: TonClientProps;
    }
  ) => Promise<any[]>;
  reset: () => void;
  downloadPdf: (filename: string) => Promise<{ base64: string; name: string }>;
}

const WebViewerContext = createContext<WebViewerProps | null>(null);

export const useWebViewerContext = () => {
  return useContext(WebViewerContext);
};

export const WebViewerProvider = ({ children }: { children: ReactNode }) => {
  const [instance, setInstance] = useState<WebViewerInstance | null>(null);
  const [signers, setSigners] = useState<Signer[]>([]);

  const isInitialized = useRef(false);

  const reset = () => {
    setInstance(null);
    setSigners([]);
    isInitialized.current = false;
  };

  const initialize = async (element: HTMLElement, initialDoc: string = "") => {
    await import("@pdftron/webviewer").then(async ({ default: WebViewer }) => {
      if (isInitialized.current) return;

      isInitialized.current = true;

      const instance = await WebViewer(
        {
          path: "/lib",
          licenseKey: PDFTRON_LICENSE_KEY,
          initialDoc, // https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf
          extension: ["pdf"],
          disabledElements: [
            // "header",
            "viewControlsButton",
            "selectToolButton",
            "toggleNotesButton",
            "ribbonsDropdown",
            "searchButton",
            "toolsHeader",
            "thumbnailsSizeSlider",
            "thumbnailControl",
            "notesPanel",
            "searchPanel",
            "redactionPanel",
            "outlinesPanelButton",
            "layersPanelButton",
            "signaturePanelButton",
            "documentControl",
            "textPopup",
            "contextMenuPopup",
            "linkButton",
            "annotationStyleEditButton",
          ],
          fullAPI: true,
        },
        element as HTMLElement
      );

      setInstance(instance);
    });

    return null;
  };

  useEffect(() => {
    if (!instance) return;

    const { Core } = instance;

    const { documentViewer, annotationManager, Annotations } = Core;

    class SignatureField extends Annotations.CustomAnnotation {
      private signer: Signer;

      constructor(signer: Signer) {
        super("SignatureField");
        this.signer = signer;
      }

      draw(ctx: CanvasRenderingContext2D, pageMatrix: any): void {
        // Set styles
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.lineWidth = 2;

        let firstName = "";
        let lastName = "";

        if (
          this.signer.parameters.applicant?.info?.firstNameEn &&
          this.signer.parameters.applicant?.info?.lastNameEn
        ) {
          firstName = this.signer.parameters.applicant.info.firstNameEn;
          lastName = this.signer.parameters.applicant.info.lastNameEn;
        } else if (this.signer.parameters?.applicant?.fixedInfo) {
          firstName =
            this.signer.parameters.applicant.fixedInfo.firstNameEn ??
            this.signer.parameters.applicant.fixedInfo.firstName;
          lastName =
            this.signer.parameters.applicant.fixedInfo.lastNameEn ??
            this.signer.parameters.applicant.fixedInfo.lastName;
        } else {
          firstName = this.signer.parameters.firstName;
          lastName = this.signer.parameters.lastName;
        }

        const id = this.signer.parameters.id;

        // Logic for KYB or KYC or nothing labels
        const isPartyCompany = this.signer.type === ApplicantType.Company;
        const partyCompanyName =
          this.signer.parameters.applicant?.info?.companyInfo?.companyName;

        const partyBeneficiar =
          this.signer.parameters.applicant?.info?.companyInfo?.beneficiaries?.find(
            (item: any) =>
              item.applicant?.type === ApplicantType.Individual &&
              item.type === "director" &&
              item.applicant?.email === this.signer.email
          );
        const partyBeneficiarFirstName =
          partyBeneficiar?.applicant?.info?.firstNameEn ??
          partyBeneficiar?.applicant?.fixedInfo?.firstName;
        const partyBeneficiarLastName =
          partyBeneficiar?.applicant?.info?.lastNameEn ??
          partyBeneficiar?.applicant?.fixedInfo?.lastName;

        let nameString = `${firstName} ${lastName}`;

        if (isPartyCompany && partyCompanyName) {
          nameString = `${partyCompanyName}, by ${
            partyBeneficiarFirstName || firstName
          } ${partyBeneficiarLastName || lastName}`;
        }

        // const isValidator =
        //   (this.signer.roleType ?? RoleType.Signer) === RoleType.Validator;

        const lines =
          this.signer.action === "signed"
            ? // isValidator
              //   ? [this.signer.roleName, `Validated By:`, nameString, `${id}`]
              //   :
              [this.signer.roleName, `Signed By:`, nameString, `${id}`]
            : // isValidator
              // ? [this.signer.roleName, "Validate here:", nameString, `${id}`]
              // :
              [this.signer.roleName, "Sign here:", nameString, `${id}`];

        // Measure text width to find the maximum width
        ctx.font = "12px Arial";
        ctx.textBaseline = "middle";

        ctx.save();
        ctx.restore();

        let maxWidth = 0;
        for (const line of lines) {
          const metrics = ctx.measureText(line);
          if (metrics.width > maxWidth) {
            maxWidth = metrics.width;
          }
        }

        // Add some padding around the text
        const padding = 10;
        const actualWidth = maxWidth + 2 * padding;

        // Draw a rectangle for the stamp
        ctx.beginPath();
        ctx.rect(this.X, this.Y, actualWidth, this.Height);
        ctx.fill();
        ctx.stroke();

        this.Width = actualWidth;

        // Draw the text
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        let yOffset = 12; // Start position for text, you can adjust this value
        for (const line of lines) {
          if (line === this.signer.roleName) {
            ctx.font = "bold 12px Arial"; // Set bold for roleName
          } else {
            ctx.font = "12px Arial"; // Set normal for other lines
          }
          ctx.fillText(line, this.X + padding, this.Y + yOffset);
          yOffset += 14; // Move to the next line, you can adjust this value
        }
      }

      serialize(element: Element, pageMatrix: any) {
        this.setCustomData("signer", JSON.stringify(this.signer));
        return super.serialize(element, pageMatrix);
      }

      deserialize(element: Element, pageMatrix: any) {
        super.deserialize(element, pageMatrix);
        this.signer = JSON.parse(this.getCustomData("signer") || "{}");
      }
    }

    SignatureField.prototype.elementName = "SignatureField";
    SignatureField.SerializationType =
      Annotations.CustomAnnotation.SerializationTypes.FreeText;

    annotationManager.registerAnnotationType(
      SignatureField.prototype.elementName,
      SignatureField
    );

    const listener = async () => {
      if (signers.length === 0) return;

      const pageInfo = documentViewer.getDocument().getPageInfo(1);
      const pageWidth = pageInfo.width;
      const pageHeight = pageInfo.height;

      await documentViewer
        .getDocument()
        .insertBlankPages(
          [documentViewer.getPageCount() + 1],
          pageWidth,
          pageHeight
        );

      const pageCount = documentViewer.getPageCount();

      const paddingX = 20;
      const paddingY = 20;

      signers.forEach((signer, index) => {
        let firstName = "";
        let lastName = "";

        signer.parameters.firstName = signer.parameters.firstName ?? "";
        signer.parameters.lastName = signer.parameters.lastName ?? "";

        if (
          signer.parameters?.applicant?.info?.firstNameEn &&
          signer.parameters?.applicant?.info?.lastNameEn
        ) {
          firstName = signer.parameters.applicant.info.firstNameEn;
          lastName = signer.parameters.applicant.info.lastNameEn;
        } else if (signer.parameters?.applicant?.fixedInfo) {
          firstName = signer.parameters.applicant.fixedInfo.firstNameEn;
          lastName = signer.parameters.applicant.fixedInfo.lastNameEn;
        } else {
          firstName = signer.parameters.firstName;
          lastName = signer.parameters.lastName;
        }

        const signatureAnnot = new SignatureField(signer);
        signatureAnnot.ReadOnly = true;
        signatureAnnot.PageNumber = pageCount;
        signatureAnnot.X = paddingX;
        signatureAnnot.Y = index * 75 + paddingY;
        signatureAnnot.Width = 50;
        signatureAnnot.Height = 64;
        signatureAnnot.Author = `${firstName} ${lastName}`;
        signatureAnnot.Subject = `${ANNOTATION_SUBJECT_PREFIX}-sign-${signer.parameters.id}`;
        signatureAnnot.StrokeColor = new Annotations.Color(255, 255, 255, 0);
        signatureAnnot.StrokeThickness = 0;

        annotationManager.addAnnotation(signatureAnnot);
        annotationManager.redrawAnnotation(signatureAnnot);
      });
    };

    documentViewer.addEventListener("documentLoaded", listener);

    return () => {
      documentViewer.removeEventListener("documentLoaded", listener);
    };
  }, [instance, signers]);

  const exportAnnotations = async () => {
    if (!instance) return "";
    const { annotationManager } = instance.Core;
    const annotations = annotationManager.getAnnotationsList();

    annotations.forEach((annotation) => {
      annotation.ReadOnly = true;
    });
    const fdfString = await annotationManager.exportAnnotations({
      annotList: annotations,
    });
    return fdfString;
  };

  const loadDocument = async (
    file: string | Blob | ArrayBuffer | File
  ): Promise<boolean> => {
    if (instance) {
      await instance.Core.documentViewer.loadDocument(file, {
        filename: "contract.pdf",
      });
      return true;
    }
    return false;
  };

  const mergeDocument = async (
    file: string | Blob | ArrayBuffer | File
  ): Promise<boolean> => {
    if (instance) {
      await instance.Core.documentViewer.getDocument().mergeDocument(file);
      return true;
    }
    return false;
  };

  const addSigners = (signers: Signer[]) => {
    setSigners(signers);
  };

  const addSigner = (signer: Signer) => {
    setSigners((prev) => [...prev, signer]);
  };

  const removeSigner = (signer: Signer) => {
    setSigners((prev) =>
      prev.filter((s) => s.parameters.id !== signer.parameters.id)
    );
  };

  const getOptimizedDocument = (buffer: Uint8Array) => {
    if (!instance || !PDFTRON_LICENSE_KEY) return Promise.reject();

    const { PDFNet } = instance.Core;
    return PDFNet.runWithCleanup(async () => {
      const doc = await PDFNet.PDFDoc.createFromBuffer(buffer);
      doc.initSecurityHandler();
      await doc.lock();

      await PDFNet.Optimizer.optimize(doc);
      return await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_linearized);
    }, PDFTRON_LICENSE_KEY);
  };

  const loadSignFields = async (
    annotations: any, //Core.Annotations.Annotation[],
    signer: Signer,
    {
      ethClientProps,
      tonClientProps,
    }: {
      ethClientProps?: EthClientProps;
      tonClientProps?: TonClientProps;
    }
  ) => {
    if (!instance) return [];

    const { annotationManager } = instance.Core;

    const annotationsToDelete: Core.Annotations.Annotation[] = [];
    const annotationsToDraw: Core.Annotations.Annotation[] = [];

    const signerAnnotations: any[] = [];

    const { signer: account } = ethClientProps
      ? await getSignerAndProviderByWalletClient(
          ethClientProps.ethWalletClient,
          ethClientProps.particleProvider,
          ethClientProps.isParticle
        )
      : { signer: null };

    const accountAddress = account?.address ?? tonClientProps?.address ?? "";

    for (const annotation of annotations) {
      annotation.ReadOnly = true;
      annotation.Hidden = false;

      if (
        !annotation.Subject ||
        !annotation.Subject.startsWith(ANNOTATION_SUBJECT_PREFIX)
      )
        continue;

      annotation.signer = signer;
      annotation.setCustomData("signer", JSON.stringify(signer));

      const address = signer?.parameters?.id;
      if (!address || !accountAddress) continue;

      if (address.toLowerCase() === accountAddress.toLowerCase()) {
        annotationManager.updateAnnotation(annotation);

        signerAnnotations.push(annotation);
        annotationsToDraw.push(annotation);
      } else {
        annotationsToDelete.push(annotation);
      }
    }

    annotationManager.drawAnnotationsFromList(annotationsToDraw);
    annotationManager.deleteAnnotations(annotationsToDelete, { force: true });

    return signerAnnotations;
  };

  const downloadPdf = async (filename: string) => {
    if (!instance) {
      return { base64: "", name: "" };
    }

    const { documentViewer, annotationManager } = instance.Core;

    documentViewer.refreshAll();

    const xfdfString = await annotationManager.exportAnnotations();

    const result = await documentViewer
      .getDocument()
      .getFileData({ flatten: true, includeAnnotations: true, xfdfString });
    documentViewer.refreshAll();
    let buffer = Buffer.from(result);
    const fileDataBase64 = buffer.toString("base64");
    // await instance.UI.downloadPdf({
    //   filename,
    //   includeAnnotations: true,
    //   flatten: true,
    // });
    return {
      base64: `data:application/pdf;base64,${fileDataBase64}`,
      name: filename,
    };
  };

  return (
    <WebViewerContext.Provider
      value={{
        instance,
        initialize,
        exportAnnotations,
        loadDocument,
        mergeDocument,
        addSigners,
        addSigner,
        removeSigner,
        getOptimizedDocument,
        loadSignFields,
        downloadPdf,
        reset,
      }}
    >
      {children}
    </WebViewerContext.Provider>
  );
};

export const useWebViewer = () => {
  const hookData = useContext(WebViewerContext);
  if (!hookData) throw new Error("Hook used without provider");
  return hookData;
};
