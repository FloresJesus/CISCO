// Formatear fecha
export function formatDate(dateString) {
    if (!dateString) return "N/A"
  
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Fecha inválida"
  
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }
  
  // Formatear moneda
  export function formatCurrency(amount) {
    if (amount === undefined || amount === null) return "N/A"
  
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }
  
  // Formatear porcentaje
  export function formatPercentage(value) {
    if (value === undefined || value === null) return "N/A"
  
    return new Intl.NumberFormat("es-ES", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100)
  }
  