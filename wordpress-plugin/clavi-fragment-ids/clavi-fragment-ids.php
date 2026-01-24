<?php
/**
 * Plugin Name: CLAVI Fragment IDs (Stable)
 * Plugin URI: https://nands.tech/clavi
 * Description: 安定したFragment ID自動付与（DOMパーサ使用・Option A版）
 * Version: 2.0.0
 * Author: CLAVI SaaS
 * Author URI: https://nands.tech
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: clavi-fragment-ids
 * 
 * Phase 4.5: WordPress プラグイン（確定版）
 * - DOMパーサ使用（regex依存回避）
 * - Fragment ID安定性仕様確定（ハッシュ固定 + エイリアス）
 * - JSON-LD注入機能
 * 
 * @version 2.0.0
 * @date 2026-01-12
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// =====================================================
// Phase 4.5.1: 見出しid自動付与（DOMパーサ使用）
// =====================================================

/**
 * ⚠️ 修正1: DOMパーサ使用（regex依存回避）
 * 
 * フィルター優先度: 999（最後に実行）
 * これにより、他のプラグインの処理が完了した後に実行される
 */
add_filter('the_content', 'clavi_add_stable_fragment_ids', 999);

function clavi_add_stable_fragment_ids($content) {
    // 空のコンテンツをスキップ
    if (empty($content)) {
        return $content;
    }
    
    // 管理画面では実行しない
    if (is_admin()) {
        return $content;
    }
    
    // DOMDocument使用（regexより安全）
    libxml_use_internal_errors(true);
    $dom = new DOMDocument('1.0', 'UTF-8');
    
    // UTF-8対応（meta charset追加）
    // LIBXML_HTML_NOIMPLIED: <html><body>タグを追加しない
    // LIBXML_HTML_NODEFDTD: DOCTYPE宣言を追加しない
    $dom->loadHTML('<?xml encoding="UTF-8">' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    
    // H2/H3見出しを取得
    $xpath = new DOMXPath($dom);
    $headings = $xpath->query('//h2 | //h3');
    
    if ($headings->length === 0) {
        return $content;
    }
    
    // 見出し処理カウンター
    $processed_count = 0;
    
    foreach ($headings as $heading) {
        $level = $heading->nodeName; // "h2" or "h3"
        
        // 既にid属性がある場合はスキップ
        if ($heading->hasAttribute('id')) {
            continue;
        }
        
        // 見出しテキスト取得
        $text = trim($heading->textContent);
        if (empty($text)) {
            continue;
        }
        
        // 見出し直後のコンテンツ取得（ハッシュ用）
        $next_content = '';
        $next_node = $heading->nextSibling;
        
        // 次の要素ノードを探す
        while ($next_node && $next_node->nodeType !== XML_ELEMENT_NODE) {
            $next_node = $next_node->nextSibling;
        }
        
        if ($next_node) {
            $next_content = trim($next_node->textContent);
        }
        
        // ⚠️ Fragment ID生成（安定版：ハッシュ固定）
        $fragment_id = clavi_generate_stable_fragment_id($level, $text, $next_content);
        
        // id属性を付与
        $heading->setAttribute('id', $fragment_id);
        $processed_count++;
    }
    
    // HTML出力
    $output = $dom->saveHTML();
    
    // <?xml encoding...>を削除
    $output = preg_replace('/<\?xml[^>]+\?>/', '', $output);
    
    // デバッグログ（開発時のみ）
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log("[CLAVI Fragment IDs] Processed {$processed_count} headings");
    }
    
    return $output;
}

// =====================================================
// Fragment ID安定性仕様確定版
// =====================================================

/**
 * ⚠️ Fragment ID安定性仕様確定版
 * 
 * ルール:
 * 1. 見出しレベル + スラグ + ハッシュ（初回本文の最初50文字）
 * 2. ハッシュは初回生成時に固定（metadataに保存）
 * 3. 見出し文言変更時もハッシュは変わらない
 * 
 * 形式: h2-{slug}-{hash8}
 * 例: h2-pricing-overview-a3f9c2d1
 * 
 * @param string $level 見出しレベル（"h2" or "h3"）
 * @param string $text 見出しテキスト
 * @param string $content 見出し直後のコンテンツ
 * @return string Fragment ID
 */
function clavi_generate_stable_fragment_id($level, $text, $content) {
    global $post;
    
    if (!$post) {
        // $postが取得できない場合のフォールバック
        return clavi_generate_simple_fragment_id($level, $text);
    }
    
    // メタデータから既存ハッシュを取得（更新時）
    $existing_hashes = get_post_meta($post->ID, '_clavi_fragment_hashes', true);
    if (!is_array($existing_hashes)) {
        $existing_hashes = [];
    }
    
    // スラグ生成
    $slug = sanitize_title($text);
    $slug = substr($slug, 0, 30);
    
    // ハッシュキー生成
    $hash_key = $level . '_' . $slug;
    
    // ハッシュ生成（初回のみ、更新時は既存を使用）
    if (isset($existing_hashes[$hash_key])) {
        // 既存ハッシュを使用（安定性確保）
        $hash = $existing_hashes[$hash_key];
    } else {
        // 初回ハッシュ生成（8文字固定）
        $hash = substr(md5(substr($content, 0, 50)), 0, 8);
        
        // メタデータに保存
        $existing_hashes[$hash_key] = $hash;
        update_post_meta($post->ID, '_clavi_fragment_hashes', $existing_hashes);
    }
    
    // Fragment ID: h2-pricing-overview-a3f9c2d1
    return $level . '-' . $slug . '-' . $hash;
}

/**
 * シンプルなFragment ID生成（フォールバック用）
 */
function clavi_generate_simple_fragment_id($level, $text) {
    $slug = sanitize_title($text);
    $slug = substr($slug, 0, 30);
    return $level . '-' . $slug . '-' . substr(md5($text), 0, 8);
}

// =====================================================
// Phase 4.5.2: JSON-LD注入機能
// =====================================================

/**
 * JSON-LD注入機能
 * 
 * SaaSで生成されたJSON-LDを <head> に注入
 * 優先度: 5（早めに実行）
 */
add_action('wp_head', 'clavi_inject_jsonld', 5);

function clavi_inject_jsonld() {
    // 単一投稿のみ対象
    if (!is_single()) {
        return;
    }
    
    global $post;
    if (!$post) {
        return;
    }
    
    // SaaSから生成されたJSON-LDを取得（カスタムフィールドから）
    $jsonld = get_post_meta($post->ID, '_clavi_jsonld', true);
    
    if (empty($jsonld)) {
        return;
    }
    
    // JSON-LD出力
    echo "\n<!-- CLAVI Fragment IDs: JSON-LD (Generated by SaaS) -->\n";
    echo '<script type="application/ld+json">' . "\n";
    echo $jsonld . "\n";
    echo '</script>' . "\n";
    echo "<!-- /CLAVI Fragment IDs -->\n\n";
}

// =====================================================
// 管理画面: JSON-LDメタボックス
// =====================================================

/**
 * JSON-LDメタボックス追加
 */
add_action('add_meta_boxes', 'clavi_add_jsonld_metabox');

function clavi_add_jsonld_metabox() {
    add_meta_box(
        'clavi_jsonld_metabox',
        'CLAVI JSON-LD設定',
        'clavi_jsonld_metabox_callback',
        'post',
        'normal',
        'high'
    );
}

/**
 * メタボックスのコールバック
 */
function clavi_jsonld_metabox_callback($post) {
    // Nonce フィールド追加（セキュリティ）
    wp_nonce_field('clavi_jsonld_metabox_nonce', 'clavi_jsonld_metabox_nonce');
    
    // 既存のJSON-LD取得
    $jsonld = get_post_meta($post->ID, '_clavi_jsonld', true);
    
    ?>
    <div class="aso-jsonld-metabox">
        <p class="description">
            <strong>CLAVI SaaS</strong>で生成されたJSON-LDを貼り付けてください。<br>
            保存すると、ページの<code>&lt;head&gt;</code>に自動的に注入されます。
        </p>
        
        <p>
            <label for="clavi_jsonld">JSON-LD:</label>
        </p>
        
        <textarea 
            id="clavi_jsonld" 
            name="clavi_jsonld" 
            rows="20" 
            style="width:100%; font-family: monospace; font-size: 12px;"
            placeholder='{"@context": "https://schema.org", ...}'
        ><?php echo esc_textarea($jsonld); ?></textarea>
        
        <?php if (!empty($jsonld)): ?>
        <p style="margin-top: 10px;">
            <a href="https://search.google.com/test/rich-results" target="_blank" class="button">
                Rich Results Test で検証
            </a>
            <a href="https://validator.schema.org/" target="_blank" class="button">
                Schema.org Validator で検証
            </a>
        </p>
        <?php endif; ?>
        
        <p style="margin-top: 10px;">
            <button type="button" class="button" onclick="document.getElementById('clavi_jsonld').value = '';">
                JSON-LDをクリア
            </button>
        </p>
    </div>
    
    <style>
        .clavi-jsonld-metabox {
            padding: 10px;
        }
        .clavi-jsonld-metabox .description {
            margin-bottom: 15px;
            padding: 10px;
            background: #f0f0f1;
            border-left: 4px solid #2271b1;
        }
    </style>
    <?php
}

/**
 * メタボックスの保存処理
 */
add_action('save_post', 'clavi_save_jsonld_metabox');

function clavi_save_jsonld_metabox($post_id) {
    // Nonce 検証
    if (!isset($_POST['clavi_jsonld_metabox_nonce']) || 
        !wp_verify_nonce($_POST['clavi_jsonld_metabox_nonce'], 'clavi_jsonld_metabox_nonce')) {
        return;
    }
    
    // 自動保存をスキップ
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // 権限チェック
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // JSON-LD保存
    if (isset($_POST['clavi_jsonld'])) {
        $jsonld = sanitize_textarea_field($_POST['clavi_jsonld']);
        
        // JSON形式の簡易検証
        if (!empty($jsonld)) {
            $decoded = json_decode($jsonld, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                // JSON形式エラー
                add_action('admin_notices', function() {
                    echo '<div class="notice notice-error"><p>CLAVI JSON-LD: JSON形式が不正です。保存されませんでした。</p></div>';
                });
                return;
            }
        }
        
        update_post_meta($post_id, '_clavi_jsonld', $jsonld);
    }
}

// =====================================================
// 管理画面: Fragment ID一覧表示（オプション）
// =====================================================

/**
 * Fragment ID一覧メタボックス追加
 */
add_action('add_meta_boxes', 'clavi_add_fragment_ids_metabox');

function clavi_add_fragment_ids_metabox() {
    add_meta_box(
        'clavi_fragment_ids_metabox',
        'CLAVI Fragment IDs（自動生成済み）',
        'clavi_fragment_ids_metabox_callback',
        'post',
        'side',
        'default'
    );
}

/**
 * Fragment ID一覧表示
 */
function clavi_fragment_ids_metabox_callback($post) {
    $existing_hashes = get_post_meta($post->ID, '_clavi_fragment_hashes', true);
    
    if (empty($existing_hashes) || !is_array($existing_hashes)) {
        echo '<p>まだFragment IDが生成されていません。</p>';
        echo '<p class="description">記事を保存すると、見出しにFragment IDが自動的に付与されます。</p>';
        return;
    }
    
    echo '<p class="description">現在の記事には以下のFragment IDが付与されています：</p>';
    echo '<ul style="margin-top: 10px; font-family: monospace; font-size: 11px;">';
    
    foreach ($existing_hashes as $hash_key => $hash) {
        list($level, $slug) = explode('_', $hash_key, 2);
        $fragment_id = $level . '-' . $slug . '-' . $hash;
        echo '<li><code>' . esc_html($fragment_id) . '</code></li>';
    }
    
    echo '</ul>';
    
    echo '<p style="margin-top: 15px;">';
    echo '<button type="button" class="button button-small" onclick="if(confirm(\'本当に全てのFragment IDをリセットしますか？\')){document.getElementById(\'clavi_reset_fragment_ids\').value=\'1\';document.getElementById(\'post\').submit();}" title="全てのFragment IDを削除し、次回保存時に再生成します">Fragment IDをリセット</button>';
    echo '<input type="hidden" id="clavi_reset_fragment_ids" name="clavi_reset_fragment_ids" value="0">';
    echo '</p>';
}

/**
 * Fragment IDリセット処理
 */
add_action('save_post', 'clavi_reset_fragment_ids_if_requested');

function clavi_reset_fragment_ids_if_requested($post_id) {
    if (isset($_POST['clavi_reset_fragment_ids']) && $_POST['clavi_reset_fragment_ids'] === '1') {
        delete_post_meta($post_id, '_clavi_fragment_hashes');
        
        add_action('admin_notices', function() {
            echo '<div class="notice notice-success"><p>CLAVI Fragment IDs: 全てのFragment IDをリセットしました。次回保存時に再生成されます。</p></div>';
        });
    }
}

// =====================================================
// プラグイン有効化・無効化フック
// =====================================================

/**
 * プラグイン有効化時
 */
register_activation_hook(__FILE__, 'clavi_fragment_ids_activate');

function clavi_fragment_ids_activate() {
    // ASO → CLAVI メタキー移行（旧プラグインからの移行対応）
    clavi_migrate_aso_meta_keys();
}

/**
 * 旧ASOプラグインのメタキーをCLAVIに移行
 * _aso_fragment_hashes → _clavi_fragment_hashes
 * _aso_jsonld → _clavi_jsonld
 */
function clavi_migrate_aso_meta_keys() {
    global $wpdb;

    // _aso_fragment_hashes → _clavi_fragment_hashes
    $wpdb->query(
        "UPDATE {$wpdb->postmeta} SET meta_key = '_clavi_fragment_hashes' WHERE meta_key = '_aso_fragment_hashes' AND NOT EXISTS (SELECT 1 FROM (SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_clavi_fragment_hashes') AS existing WHERE existing.post_id = {$wpdb->postmeta}.post_id)"
    );

    // _aso_jsonld → _clavi_jsonld
    $wpdb->query(
        "UPDATE {$wpdb->postmeta} SET meta_key = '_clavi_jsonld' WHERE meta_key = '_aso_jsonld' AND NOT EXISTS (SELECT 1 FROM (SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_clavi_jsonld') AS existing WHERE existing.post_id = {$wpdb->postmeta}.post_id)"
    );

    // 移行完了後に旧キーを削除
    $wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE meta_key = '_aso_fragment_hashes'");
    $wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE meta_key = '_aso_jsonld'");
}

/**
 * プラグイン無効化時
 */
register_deactivation_hook(__FILE__, 'clavi_fragment_ids_deactivate');

function clavi_fragment_ids_deactivate() {
    // メタデータは削除しない（再有効化時に復元するため）
}

