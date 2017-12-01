function printJobHook(inputs, actions) {
  /*
  * Defaults quota defination
  */
  coutaColorDefault = 10;
  coutaNegroDefault = 20;
  
 /*
  * Fechas
  * dia Define el dia que se hare el reset, dia especifico del mes
  * intervalo de mes, difine si el reinicio se hara de manera mensual
  * intervalo de dias, define si el reinicio se hara por dias
  * *** intervalo_mes e intervalo_dias, siempre debe estar uno definido, en no pueden ser ambos null.
  * *** el dia de reinicio siempre debe ser definido.
  */ 
  
  //intervalo_dias = null; //intervalo de dias para reset a contar del inicio del script
  dia = 1;  // dia especifico del mes para reset 
  intervalo_mes = 1; //intervalo de meses  (1 es cada un mes)
  
  
  
  /*
  * This print hook will need access to all job details
  * so return if full job analysis is not yet complete.
  * The only job details that are available before analysis
  * are metadata such as username, printer name, and date.
  *
  * See reference documentation for full explanation.
  */
  if (!inputs.job.isAnalysisComplete) {
    // No job details yet so return.
    return;
  }
  

  
  
  coutaSiguienteResetDefault = new Date();
  coutaResetDefault = new Date();
  
  
  cuotaReset =inputs.utils.getProperty('cuotaReset');
  siguienteReset = inputs.utils.getProperty('siguienteReset');
  
  if(cuotaReset == null){
    actions.utils.onCompletionSaveProperty("cuotaReset", getFormattedDate(coutaResetDefault),{'saveWhenCancelled' : true});
    cuotaReset = coutaResetDefault;
  }else{
    cuotaReset = new Date(cuotaReset);
  }
  
  if(siguienteReset == null){
    actions.utils.onCompletionSaveProperty("siguienteReset", getFormattedDate(coutaSiguienteResetDefault),{'saveWhenCancelled' : true});
    siguienteReset = coutaSiguienteResetDefault;
  }else{
    siguienteReset = new Date(siguienteReset);
  }
  
  
  //actions.log.info("Fecha Reset:" + getFormattedDate(cuotaReset));
  //actions.log.info("Fecha Proximo Reset:" + getFormattedDate(siguienteReset));
  
  if(Date.now() >= siguienteReset.getTime())
  {
    actions.log.info("Actualizando fecha de reset");
    actions.utils.onCompletionSaveProperty("cuotaReset", getFormattedDate(siguienteReset),{'saveWhenCancelled' : true});
    siguiente = siguienteReset;
    siguiente.setDate(dia);
    
    if(intervalo_mes !== null){      
      //suma intervalo de meses
      actions.log.info("Actualizando por mes");
      siguiente.setMonth(siguienteReset.getMonth() + intervalo_mes);      
      siguiente.setDate(dia);
    }else if(intervalo_dias !== null){
      actions.log.info("Actualizando por dia");      
      siguiente = siguiente.setDate(siguiente.getTime() + (intervalo_dias * 86400000));
    }
    
    actions.log.info("Siguiente actualizacion" + siguiente.toString());
    actions.utils.onCompletionSaveProperty("siguienteReset", getFormattedDate(siguiente),{'saveWhenCancelled' : true});
    
    cuotaReset = siguienteReset;
    siguienteReset = siguiente;
  }
  
  
  /*
  * Recolectar variables globales
  */
  
  
  cuotaColor = inputs.utils.getProperty('cuotaColor');
  cuotaNegro = inputs.utils.getProperty('cuotaNegro');  
  
  if(cuotaColor == null){
    actions.utils.onCompletionSaveProperty("cuotaColor", coutaColorDefault,{'saveWhenCancelled' : true});
    cuotaColor = coutaColorDefault;
  }
  
  if(cuotaNegro == null){
    actions.utils.onCompletionSaveProperty("cuotaNegro", coutaNegroDefault,{'saveWhenCancelled' : true});
    cuotaNegro = coutaNegroDefault;
  }
  
  usuarioReset = inputs.user.getProperty('reset');
  usuarioColor = inputs.user.getProperty('color');
  usuarioNegro = inputs.user.getProperty('negro');
  
  if(usuarioReset == null)
  {
    usuarioReset = new Date();
    usuarioColor = 0;
    usuarioNegro = 0;
  }else{
    usuarioReset = new Date(usuarioReset);
    usuarioColor = parseInt(usuarioColor);
    usuarioNegro = parseInt(usuarioNegro);
  }
  
  //actions.log.info("reset de usuario es: " + usuarioReset.toString());
  //actions.log.info("reset de cuota es: " + cuotaReset.toString());
  
  //Resetear la cuota del usuario
  if(usuarioReset.getTime() < cuotaReset.getTime()){
    //actions.log.info("Reseteando cuota de usuario " + usuarioReset);
    actions.user.onCompletionSaveProperty("reset", getFormattedDate(cuotaReset),{'saveWhenCancelled' : true});
    actions.user.onCompletionSaveProperty("color", 0,{'saveWhenCancelled' : true});
    actions.user.onCompletionSaveProperty("negro", 0,{'saveWhenCancelled' : true});
    usuarioReset = cuotaReset;
    usuarioColor = 0;
    usuarioNegro = 0;
  }
  
  
  if (inputs.job.isColor) {
    if(usuarioColor + inputs.job.totalPages <= cuotaColor)
      actions.user.onCompletionIncrementNumberProperty('color', inputs.job.totalPages);  
    else{
      actions.client.sendMessage("Este trabajo sobrepasa el limite de impresion color por este periodo. (Paginas restantes:"+(usuarioColor-cuotaColor)+")");
      actions.job.cancel();
      return;
    }
  }
  
  
  // if the job is Grayscale
  if (inputs.job.isGrayscale) {
    //actions.client.sendMessage("usuario:" + usuarioNegro +"- total pages:"+inputs.job.totalPages + "-cuotaNegro"+cuotaNegro + "- suma:" + (usuarioNegro + inputs.job.totalPages));    
    if(usuarioNegro + inputs.job.totalPages <= cuotaNegro)
      actions.user.onCompletionIncrementNumberProperty('negro', inputs.job.totalPages);
    else{
      actions.client.sendMessage("Este trabajo sobrepasa el limite de impresion en negro por este periodo(Paginas restantes:"+(usuarioColor-cuotaColor)+")");
      actions.job.cancel();
      return;
      
    }
  }
  
  
  
  // If here, the user pressed Print, so allow it to print.
  
}

function getFormattedDate(date) {
  var year = date.getFullYear();
  
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  
  return year + '/' + month + '/' + day;
}