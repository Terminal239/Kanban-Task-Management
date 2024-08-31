import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import OTP from "otp";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // For generating a unique identifier if needed
import { authentication, db } from "../../../firebase/config";
import Button from "../Reusable/Button";
import CircularProgress from "../Reusable/CircularProgress";
import ModalWrapper from "../Utils/ModalWrapper";
import base32Encode from "base32-encode";

interface Props {
  twoFactor: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setTwoFactor: React.Dispatch<React.SetStateAction<boolean>>;
}

const TwoFactorModal = ({ twoFactor, setTwoFactor, setShowModal }: Props) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = authentication.currentUser!.uid;

    if (twoFactor) generateTOTPSecret(userId);
  }, [twoFactor]);

  const generateTOTPSecret = async (userId: string) => {
    setLoading(true);

    const profileRef = doc(db, `${userId}/profile`);
    const profileDoc = await getDoc(profileRef);
    let otp;

    if (!profileDoc.data()?.totpSecret) {
      const secretBuffer = new TextEncoder().encode(uuidv4().replace(/-/g, "").slice(0, 10)); // Shortened to 10 bytes
      const secret = base32Encode(secretBuffer, "RFC4648", { padding: false });

      otp = new OTP({
        name: "KanbanTaskManagement",
        keySize: 128, // You can adjust this size if needed
        codeLength: 6,
        secret: secret,
      });
      await setDoc(
        profileRef,
        {
          totpSecret: otp.secret,
          isTwoFactorEnabled: true,
        },
        { merge: true }
      );
    } else otp = new OTP({ name: "Kanban Task Management", keySize: 128, codeLength: 6, secret: profileDoc.data()?.totpSecret });

    const otpauth = `otpauth://totp/${encodeURIComponent("Kanban Task Management")}:${encodeURIComponent(userId)}?secret=${otp.secret}&issuer=${encodeURIComponent("Kanban Task Management")}&algorithm=SHA1&digits=6&period=30`;
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    setQrCodeUrl(qrCodeUrl);
    setLoading(false);
  };

  // async function generateTOTPSecret(userId) {
  //   setLoading(true);

  //   // Generate a new TOTP instance with a specified key size and code length
  //   const otp = new OTP({
  //     name: "KanbanTaskManagement",
  //     keySize: 128, // You can adjust this size if needed
  //     codeLength: 6,
  //     secret: uuidv4().replace(/-/g, "").slice(0, 20), // Generate a unique 20-character secret
  //   });

  //   // Generate the TOTP URL using the specified parameters

  //   // Save the TOTP secret to the user's profile in Firestore
  //   await setDoc(doc(db, `users/${userId}`), { totpSecret: otp.secret, isTwoFactorEnabled: true }, { merge: true });

  //   // Generate a QR code for the TOTP URL
  //   const qrCodeUrl = await QRCode.toDataURL(otpauth);
  //   setQrCodeUrl(qrCodeUrl);

  //   setLoading(false);
  // }

  async function enableTwoFactorAuthentication() {
    const userId = authentication.currentUser!.uid;

    try {
      const userDocRef = doc(db, userId, "profile");
      await updateDoc(userDocRef, {
        isTwoFactorEnabled: true,
      });
      setTwoFactor(true);
    } catch (error) {
      console.error("Error enabling 2FA:", error);
    }
  }

  const disableTwoFactorAuthentication = async () => {
    try {
      const userId = authentication.currentUser!.uid;

      if (userId) {
        await setDoc(doc(db, userId, "profile"), { totpSecret: null }, { merge: true });

        const userDocRef = doc(db, userId, "profile");
        await updateDoc(userDocRef, {
          isTwoFactorEnabled: false,
        });
      }

      setTwoFactor(false);
    } catch (error) {
      console.error("Error disabling TOTP:", error);
    }
  };

  return (
    <ModalWrapper className="!pt-8" setShowModal={setShowModal}>
      <div className="flex flex-col items-center gap-8 text-center leading-6 md:text-lg">
        {twoFactor ? (
          <>
            {loading ? <CircularProgress /> : <img src={qrCodeUrl} alt="TOTP QR Code" />}
            <div className="text-left">
              <p className="text-lg font-bold md:text-xl">Instructions:</p>
              <ol className="list-inside list-decimal">
                <li>Scan the QR code using an authenticator app.</li>
                <li>Enter the 6-digit code from the next login.</li>
              </ol>
            </div>
            <Button type="desctructive" handleClick={disableTwoFactorAuthentication}>
              Disable 2FA
            </Button>
          </>
        ) : (
          <>
            <p>Protect your account by adding an extra layer of security. Use a TOTP authenticator app to generate a one-time code.</p>
            <Button type="primary" handleClick={enableTwoFactorAuthentication}>
              Enable 2FA
            </Button>
          </>
        )}
      </div>
    </ModalWrapper>
  );
};

export default TwoFactorModal;
