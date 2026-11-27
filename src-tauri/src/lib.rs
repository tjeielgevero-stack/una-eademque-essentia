#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      #[cfg(desktop)]
      {
        app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
        let handle = app.handle().clone();
        tauri::async_runtime::spawn(async move {
          if let Err(error) = check_for_updates(handle).await {
            log::warn!("Automatic update check failed: {error}");
          }
        });
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}

#[cfg(desktop)]
async fn check_for_updates(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
  use tauri_plugin_updater::UpdaterExt;

  if let Some(update) = app.updater()?.check().await? {
    update
      .download_and_install(|_, _| {}, || {})
      .await?;
    app.restart();
  }

  Ok(())
}
