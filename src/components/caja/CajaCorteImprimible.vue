<template>
  <div>
    <div style="font-family:monospace;font-size:12px;max-width:300px;margin:0 auto;padding:16px;">
      <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:8px;margin-bottom:8px;">
        <h2 style="margin:0;font-size:16px;">EASY ORDER</h2>
        <p style="margin:4px 0 0;">CORTE DE CAJA</p>
        <p style="margin:4px 0 0;font-size:11px;">{{ corteFecha }}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <tbody>
          <!-- Fondo de apertura -->
          <tr>
            <td>Fondo apertura</td>
            <td style="text-align:right">${{ fm(openingAmount) }}</td>
          </tr>
          <tr><td colspan="2" style="border-bottom:1px dashed #ccc;"></td></tr>

          <!-- Desglose de ventas -->
          <tr>
            <td>Ventas Efectivo</td>
            <td style="text-align:right">${{ fm(efectivoSales) }}</td>
          </tr>
          <tr>
            <td>Ventas Tarjeta</td>
            <td style="text-align:right">${{ fm(cardSales) }}</td>
          </tr>
          <tr>
            <td>Transferencias</td>
            <td style="text-align:right">${{ fm(transferSales) }}</td>
          </tr>
          <tr style="border-top:1px dashed #000;">
            <td><strong>Total Ventas</strong></td>
            <td style="text-align:right"><strong>${{ fm(totalVentas) }}</strong></td>
          </tr>

          <!-- Propinas -->
          <tr>
            <td>Propinas</td>
            <td style="text-align:right">${{ fm(totalTips) }}</td>
          </tr>

          <tr><td colspan="2" style="padding:4px;"></td></tr>

          <!-- Efectivo en caja -->
          <tr style="border-top:2px solid #000;font-weight:bold;">
            <td>Efectivo en Caja</td>
            <td style="text-align:right">${{ fm(cashInRegister) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Información adicional -->
      <div style="margin-top:12px;padding-top:8px;border-top:1px dashed #000;font-size:10px;color:#666;">
        <p style="margin:4px 0;">Formas de pago aceptadas:</p>
        <p style="margin:2px 0;">• Efectivo</p>
        <p style="margin:2px 0;">• Tarjeta (con voucher)</p>
        <p style="margin:2px 0;">• Transferencia</p>
      </div>

      <p style="text-align:center;margin-top:16px;border-top:1px dashed #000;padding-top:8px;font-size:10px;">
        Generado por Easy Order
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  openingAmount:  { type: Number, default: 0 },
  efectivoSales:  { type: Number, default: 0 },
  cardSales:      { type: Number, default: 0 },
  transferSales:  { type: Number, default: 0 },
  totalTips:      { type: Number, default: 0 },
  totalVentas:    { type: Number, default: 0 },
  cashInRegister: { type: Number, default: 0 },
  corteFecha:     { type: String, default: '' },
})

const fm = (v) => Number(v || 0).toFixed(2)
</script>
