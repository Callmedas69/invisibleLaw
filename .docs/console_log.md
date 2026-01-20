Debug info:
- Execution of get_written_endpoint_with_issues_operation failed
- Execution of endpoint_write_to_disk failed
- Execution of <PageEndpoint as Endpoint>::output failed       
- Failed to write page endpoint /_app
- Execution of PageEndpoint::output failed
- Execution of *ChunkGroupResult::all_assets failed
- Execution of PageEndpoint::client_chunk_group failed
- Execution of PageEndpoint::client_evaluatable_assets failed  
- content is not available as task execution failed
- Execution of PageEndpoint::client_module failed
- content is not available as task execution failed
- Execution of *create_page_loader_entry_module failed
- Execution of PagesProject::client_module_context failed      
- Execution of *ModuleAssetContext::new failed
- Execution of get_client_module_options_context failed        
- Execution of *get_jsx_transform_options failed
- Execution of get_client_resolve_options_context failed       
- Failed to lookup task id: Looking up task id for CachedTaskType { native_fn: NativeFunction { name: "NextConfig::resolve_extension", global_name: "next-core@next_core::next_config::NextConfig::resolve_extension", .. }, this: Some(RawVc::TaskCell(3, "next_core::next_config::NextConfig#0")), arg: () } from database failed

  Caused by:
      0: Unable to open static sorted file referenced from 00000575.meta
      1: Unable to open static sorted file 00000571.sst        
      2: The system cannot find the path specified. (os error 3)
    at <unknown> (TurbopackInternalError: Failed to write page endpoint /_app) {
  location: 'C:\\actions-runner\\_work\\next.js\\next.js\\turbopack\\crates\\turbo-tasks-backend\\src\\backend\\mod.rs:1354:30'
}
Error [TurbopackInternalError]: Failed to write page endpoint /_app

Caused by:
- content is not available as task execution failed
- content is not available as task execution failed
- Failed to lookup task id: Looking up task id for CachedTaskType { native_fn: NativeFunction { name: "NextConfig::resolve_extension", global_name: "next-core@next_core::next_config::NextConfig::resolve_extension", .. }, this: Some(RawVc::TaskCell(3, "next_core::next_config::NextConfig#0")), arg: () } from database failed

Debug info:
- Execution of get_written_endpoint_with_issues_operation failed
- Execution of endpoint_write_to_disk failed
- Execution of <PageEndpoint as Endpoint>::output failed       
- Failed to write page endpoint /_app
- Execution of PageEndpoint::output failed
- Execution of *ChunkGroupResult::all_assets failed
- Execution of PageEndpoint::client_chunk_group failed
- Execution of PageEndpoint::client_evaluatable_assets failed  
- content is not available as task execution failed
- Execution of PageEndpoint::client_module failed
- content is not available as task execution failed
- Execution of *create_page_loader_entry_module failed
- Execution of PagesProject::client_module_context failed      
- Execution of *ModuleAssetContext::new failed
- Execution of get_client_module_options_context failed        
- Execution of *get_jsx_transform_options failed
- Execution of get_client_resolve_options_context failed       
- Failed to lookup task id: Looking up task id for CachedTaskType { native_fn: NativeFunction { name: "NextConfig::resolve_extension", global_name: "next-core@next_core::next_config::NextConfig::resolve_extension", .. }, this: Some(RawVc::TaskCell(3, "next_core::next_config::NextConfig#0")), arg: () } from database failed

  Caused by:
      0: Unable to open static sorted file referenced from 00000575.meta
      1: Unable to open static sorted file 00000571.sst        
      2: The system cannot find the path specified. (os error 3)
    at <unknown> (TurbopackInternalError: Failed to write page endpoint /_app) {
  location: 'C:\\actions-runner\\_work\\next.js\\next.js\\turbopack\\crates\\turbo-tasks-backend\\src\\backend\\mod.rs:1354:30'
}
Persisting failed: Another write batch or compaction is already active (Only a single write operations is allowed at a time)  
