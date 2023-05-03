import mongoose from "mongoose";
import {APIEmbed} from "discord.js";
import SuggestionReactionSchema, {ISuggestionReaction} from "../../schema/SuggestionReactionSchema";

export interface IServerSettings {
    _id: mongoose.ObjectId;
    server_id: mongoose.ObjectId;
    mute_role?: string;
    log_channel?: string;
    join_leave_channel?: string;
    join_embed?: APIEmbed;
    join_dm_embed?: APIEmbed;
    leave_embed?: APIEmbed;
    join_text?: string;
    join_dm_text?: string;
    leave_text?: string;
    join_roles: string[];
    sticky_roles: string[];
    suggestions_channel?: string;
    suggestions_updates_channel?: string;
    suggestions_auto_delete: boolean;
    suggestions_reactions: ISuggestionReaction[];
    suggestions_embed?: APIEmbed;
    suggestions_discussion_threads: boolean;
}
export interface IServerSettingsMethods {
    removeJoinRole(index: number): boolean;
    removeStickyRole(index: number): boolean;
    addJoinRole(role: string): boolean;
    addStickyRole(role: string): boolean;
    setMuteRole(mute_role_id: String): boolean;
    setLogChannel(log_channel_id: String): boolean;
    setJoinLeaveChannel(join_leave_channel_id: String): boolean;
    setJoinEmbed(join_embed: APIEmbed): boolean;
    setJoinText(join_text: String): boolean;
    setJoinDMEmbed(join_dm_embed: APIEmbed): boolean;
    setJoinDMText(join_dm_text: String): boolean;
    setLeaveEmbed(leave_embed: APIEmbed): boolean;
    setLeaveText(leave_text: String): boolean;
    addSuggestionsReaction(reaction: ISuggestionReaction): ISuggestionReaction[];
    removeSuggestionsReaction(emoji: string): ISuggestionReaction[];
    removeSuggestionsReaction(index: number): ISuggestionReaction[];
    getSuggestionsReaction(emoji: string): ISuggestionReaction;

}
export interface IServerSettingsModel extends mongoose.Model<IServerSettings, {}, IServerSettingsMethods> {

}

export const ServerSettingsSchema = new mongoose.Schema<IServerSettings, IServerSettingsModel>({
    server_id: { type: mongoose.Schema.Types.ObjectId, ref: "server", required: true },
    mute_role: { type: String },
    log_channel: { type: String },
    join_leave_channel: { type: String },
    join_embed: { type: Object, default: {"type":"rich","title":"👋 Member joined! (%server_members% members.)","thumbnail":{"url":"%member_avatar_128%"},"footer":{"text":"%server_name%"},"description":"%member_mention% joined the server.","color":9159498,"author":{"name":"%message_date%"}} },
    join_dm_embed: { type: Object, default: {"type":"rich","title":"👋 Welcome to %server_name%!","thumbnail":{"url":"%server_icon_128%"},"footer":{"text":"%server_name%"},"description":"Welcome, %member_mention%! We hope you enjoy our server.","color":9159498,"author":{"name":"%message_date%"}} },
    leave_embed: { type: Object, default: {"type":"rich","title":"👋 Member left! (%server_members% members.)","thumbnail":{"url":"%member_avatar_128%"},"footer":{"text":"%server_name%"},"description":"%member_mention% left the server.","color":16007990,"author":{"name":"%message_date%"}}},
    join_text: { type: String, default: "Somebody joined the server!" },
    join_dm_text: { type: String, default: "Welcome!" },
    leave_text: { type: String, default: "Somebody left the server!" },
    join_roles: { type: [String], default: [] },
    sticky_roles: { type: [String], default: [] },
    suggestions_channel: { type: String },
    suggestions_updates_channel: { type: String },
    suggestions_auto_delete: { type: Boolean, default: false },
    suggestions_discussion_threads: { type: Boolean, default: true },
    suggestions_embed: { type: Object, default: {"type":"rich","title":"Suggestion %suggestion_id%","description":"🧍 Created By: %member_mention%\n🕰️ Date: %suggestion_date_formatted%\n\n%suggestion_content%","color":6052956,"author":{"name":"👍 Rating: %suggestion_rating%"}} },
    suggestions_reactions: { type: [SuggestionReactionSchema] }
});

ServerSettingsSchema.method("addJoinRole", function(role: string) {
    this.join_roles.push(role);
    this.save();
    return true;
})
ServerSettingsSchema.method("addStickyRole", function(role: string) {
    this.sticky_roles.push(role);
    this.save();
    return true;
});
ServerSettingsSchema.method("removeJoinRole", function(index: number) {
    this.join_roles.splice(index, 1);
    this.save();
    return true;
});
ServerSettingsSchema.method("removeStickyRole", function(index: number) {
    this.sticky_roles.splice(index, 1);
    this.save();
    return true;
});
ServerSettingsSchema.method('setMuteRole', function(mute_role_id: String) {
    this.mute_role = mute_role_id;
    this.save();
    return true;
});
ServerSettingsSchema.method('setLogChannel', function(log_channel_id: String) {
    this.log_channel = log_channel_id;
    this.save();
    return true;
});
ServerSettingsSchema.method('setJoinLeaveChannel', function(join_leave_channel_id: String) {
    this.join_leave_channel = join_leave_channel_id;
    this.save();
    return true;
});
ServerSettingsSchema.method('setJoinEmbed', function(join_embed: APIEmbed) {
    this.join_embed = join_embed;
    this.save();
    return true;
});
ServerSettingsSchema.method('setJoinDMEmbed', function(join_dm_embed: APIEmbed) {
    this.join_dm_embed = join_dm_embed;
    this.save();
    return true;
});
ServerSettingsSchema.method('setLeaveEmbed', function(leave_embed: APIEmbed) {
    this.leave_embed = leave_embed;
    this.save();
    return true;
});
ServerSettingsSchema.method('setJoinText', function(join_text: String) {
    this.join_text = join_text;
    this.save();
    return true;
});
ServerSettingsSchema.method('setJoinDMText', function(join_dm_text: String) {
    this.join_dm_text = join_dm_text;
    this.save();
    return true;
});
ServerSettingsSchema.method('setLeaveText', function(leave_text: String) {
    this.leave_text = leave_text;
    this.save();
    return true;
});
ServerSettingsSchema.method("addSuggestionsReaction", function(reaction: ISuggestionReaction) {
    this.suggestions_reactions.push(reaction);
    this.save().catch(() => undefined);
    return this.suggestions_reactions;
});
ServerSettingsSchema.method("getSuggestionsReaction", function(emoji: string) {
    return this.suggestions_reactions.find((suggestion_reaction: ISuggestionReaction) => suggestion_reaction.emoji == emoji);
});
ServerSettingsSchema.method("removeSuggestionsReaction", function(emoji: string) {
    let suggestionsReaction = this.suggestions_reactions.find((suggestion_reaction: ISuggestionReaction) => suggestion_reaction.emoji == emoji);
    if (!suggestionsReaction) return this.suggestions_reactions;
    this.suggestions_reactions.splice(this.suggestions_reactions.indexOf(suggestionsReaction), 1);
    this.save();
    return this.suggestions_reactions;
});
ServerSettingsSchema.method("removeSuggestionsReaction", function(index: number) {
    this.suggestions_reactions.splice(index, 1);
    this.save();
    return this.suggestions_reactions;
});
const ServerSettings = mongoose.model<IServerSettings, IServerSettingsModel>("server_settings", ServerSettingsSchema);
export default ServerSettings;
