import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.isHidden = true
        handleSharedItem()
    }

    func handleSharedItem() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            completeRequestAndDismiss(withError: NSError(domain: "com.whydidisavethis.share.ErrorDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "No input items found."]))
            return
        }

        var sharedUrlString: String?
        let group = DispatchGroup()

        for item in extensionItems {
            guard let attachments = item.attachments else { continue }
            for attachment in attachments {
                group.enter()
                if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (data, error) in
                        defer { group.leave() }
                        if let url = data as? URL {
                            sharedUrlString = url.absoluteString
                        } else if let error = error {
                            print("[ShareExtension] Error loading URL item: \(error.localizedDescription)")
                        }
                    }
                } else if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { (data, error) in
                        defer { group.leave() }
                        if let text = data as? String, (text.lowercased().hasPrefix("http://") || text.lowercased().hasPrefix("https://")) {
                            sharedUrlString = text
                        } else if let error = error {
                            print("[ShareExtension] Error loading plain text item: \(error.localizedDescription)")
                        }
                    }
                } else {
                    group.leave()
                }
                if sharedUrlString != nil { break }
            }
            if sharedUrlString != nil { break }
        }

        group.notify(queue: .main) {
            if let urlToShare = sharedUrlString {
                self.attemptOpenMainAppViaResponderChain(withSharedURL: urlToShare)
            } else {
                print("[ShareExtension] No suitable URL found to share.")
                self.completeRequestAndDismiss(withError: NSError(domain: "com.whydidisavethis.share.ErrorDomain", code: 2, userInfo: [NSLocalizedDescriptionKey: "No URL found in shared item."]))
            }
        }
    }

    func attemptOpenMainAppViaResponderChain(withSharedURL originalSharedURL: String) {
        print("[ShareExtension] Raw shared URL string: \(originalSharedURL)")

        let scheme = "whydidisavethis"
        let pathSegment = "add"

        var baseURLString = "\(scheme):///\(pathSegment)" // Using /// for path-based routing

        var queryConstructor = URLComponents()
        queryConstructor.queryItems = [
            URLQueryItem(name: "url", value: originalSharedURL)
        ]
        
        if let encodedQuery = queryConstructor.percentEncodedQuery {
            baseURLString += "?\(encodedQuery)"
        } else {
            print("[ShareExtension] Error: Could not create encoded query string from URL: \(originalSharedURL)")
            self.completeRequestAndDismiss(withError: NSError(domain: "com.whydidisavethis.share.ErrorDomain", code: 5, userInfo: [NSLocalizedDescriptionKey: "Failed to construct query string."]))
            return
        }
        
        print("[ShareExtension] Constructed custom scheme string: \(baseURLString)")

        guard let deepLinkURL = URL(string: baseURLString) else {
            print("[ShareExtension] Error: Could not create URL object from custom scheme string: \(baseURLString)")
            self.completeRequestAndDismiss(withError: NSError(domain: "com.whydidisavethis.share.ErrorDomain", code: 4, userInfo: [NSLocalizedDescriptionKey: "Failed to create custom URL object."]))
            return
        }
        
        print("[ShareExtension] Attempting to open via responder chain: \(deepLinkURL.absoluteString)")
        
        // Call the responder chain openURL method
        let opened = openURLViaResponder(deepLinkURL)

        if !opened {
             print("[ShareExtension] openURLViaResponder returned false, indicating UIApplication was not found or pre-iOS 10 call failed immediately.")
        }
    }

    // Responder chain method
    @discardableResult @objc func openURLViaResponder(_ url: URL) -> Bool {
        var responder: UIResponder? = self
        var attemptMade = false // To track if we even found UIApplication

        while responder != nil {
            if let application = responder as? UIApplication {
                attemptMade = true
                if #available(iOS 10.0, *) {
                    application.open(url, options: [:]) { [weak self] success in
                        guard let self = self else { return }
                        if success {
                            print("[ShareExtension] App opened successfully via UIApplication.open (Responder Chain)")
                        } else {
                            print("[ShareExtension] Failed to open app via UIApplication.open (Responder Chain). URL was: \(url.absoluteString)")
                        }
                        // Complete the request after the open attempt
                        self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
                    }
                    return true // Indicates an attempt was made with the modern API
                } else { 
                    let success = application.perform(#selector(UIApplication.openURL(_:)), with: url) != nil
                     if success {
                         print("[ShareExtension] App opened successfully via legacy UIApplication.open (Responder Chain)")
                    } else {
                         print("[ShareExtension] Failed to open app via legacy UIApplication.open (Responder Chain). URL was: \(url.absoluteString)")
                    }
                    self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
                    return success
                }
            }
            responder = responder?.next
        }
        
        // If UIApplication was not found in the responder chain
        if !attemptMade {
            print("[ShareExtension] Could not find UIApplication in responder chain to open URL: \(url.absoluteString)")
            // If no attempt was made because UIApplication wasn't found, we still need to dismiss the share sheet.
            self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
        }
        return false // Returned if UIApplication was not found.
    }

    // Helper function to complete the request and dismiss the share extension
    func completeRequestAndDismiss(withError error: Error? = nil) {
        if let error = error {
            print("[ShareExtension] Cancelling request with error: \(error.localizedDescription)")
            self.extensionContext?.cancelRequest(withError: error)
        } else {
            // This path is less likely to be hit if openURLViaResponder always completes.
            print("[ShareExtension] Completing request (from helper).")
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }
}
