"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface PixQrCodeProps {
  pixKey: string;
  pixKeyType: string;
  receiverName: string;
  city: string;
  amount?: number; // em centavos, undefined = valor livre
  description?: string;
}

function buildPixPayload({
  pixKey,
  receiverName,
  city,
  amount,
  description,
}: {
  pixKey: string;
  receiverName: string;
  city: string;
  amount?: number;
  description?: string;
}): string {
  const sanitize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 25);

  function tlv(id: string, value: string) {
    const len = String(value.length).padStart(2, "0");
    return `${id}${len}${value}`;
  }

  const merchantAccountInfo = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", pixKey);
  const merchantAccount = tlv("26", merchantAccountInfo);
  const txid = tlv("05", "***");
  const additionalData = tlv("62", txid);
  const amountStr = amount ? (amount / 100).toFixed(2) : "";

  const payload =
    tlv("00", "01") +
    merchantAccount +
    tlv("52", "0000") +
    tlv("53", "986") +
    (amountStr ? tlv("54", amountStr) : "") +
    tlv("58", "BR") +
    tlv("59", sanitize(receiverName)) +
    tlv("60", sanitize(city)) +
    (description ? tlv("62", tlv("05", description.substring(0, 25))) : additionalData);

  // CRC16-CCITT
  const payloadWithCrc = payload + "6304";
  let crc = 0xffff;
  for (let i = 0; i < payloadWithCrc.length; i++) {
    crc ^= payloadWithCrc.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return payloadWithCrc + (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

export function PixQrCode({ pixKey, pixKeyType, receiverName, city, amount, description }: PixQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pixPayload = buildPixPayload({ pixKey, receiverName, city, amount, description });

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, pixPayload, {
        width: 200,
        margin: 2,
        color: { dark: "#1a1a1a", light: "#ffffff" },
      });
    }
  }, [pixPayload]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded-lg border border-border" />
    </div>
  );
}
