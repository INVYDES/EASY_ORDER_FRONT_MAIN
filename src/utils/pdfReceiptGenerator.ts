import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateCajaPDF = (
    corte: any,
    movements: any[],
    salesByCard: number,
    salesByTransfer: number
) => {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text('Reporte de Cierre de Caja', 14, 20)

    doc.setFontSize(12)
    doc.text(`Fecha: ${new Date(corte.timestamp).toLocaleString()}`, 14, 30)
    doc.text(`Efectivo Esperado: $${corte.expected}`, 14, 40)
    doc.text(`Efectivo Real: $${corte.real}`, 14, 48)
    doc.text(`Diferencia: $${corte.difference}`, 14, 56)

    doc.text(`Ventas Tarjeta: $${salesByCard}`, 120, 40)
    doc.text(`Ventas Transferencia: $${salesByTransfer}`, 120, 48)

    // Tabla de Movimientos
    const tableData = movements.map(m => [
        m.ticketId,
        `Mesa ${m.table}`,
        m.paymentMethod || 'Efectivo',
        m.folio === 'NA' || !m.folio ? '-' : m.folio,
        `$${m.total}`,
        new Date(m.timestamp).toLocaleTimeString()
    ])

    autoTable(doc, {
        startY: 65,
        head: [['Ticket', 'Mesa', 'Método', 'Folio', 'Total', 'Hora']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
    })

    // Descargar el PDF
    doc.save(`Cierre_Caja_${new Date().getTime()}.pdf`)
}
